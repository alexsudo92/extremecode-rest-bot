const { bot } = require('./../config');
const { Transform, Logger } = require('./../util');
const moment = require('moment');
const {
    User,
    Vote,
    VoteBan,
    Counter
} = require('./../models');

const log = Logger(module);

module.exports = (() => {
    const voteEnum = Object.freeze({
        yes: 1,
        no: 0
    });

    const getTimeDuration = (createdAt) => {
        const created = moment(createdAt);
        const delta = moment().diff(moment(created));
        return moment.duration(delta);
    };

    const replyTo = async (chatId, postId, message) => bot.sendMessage(
        chatId,
        message, {
            reply_to_message_id: postId
        }
    );

    const findUser = async (username) => {
        const user = await User.findOne({
            where: {
                username: username
            },
            include: [VoteBan, Counter]
        });
        return user;
    };

    const findUserById = async (userId) => {
        const user = await User.findOne({
            where: {
                telegram_id: userId
            },
            include: [VoteBan, Counter]
        });
        return user;
    };

    const deleteVoteBan = async (votebanId) => {
        await Vote.destroy({
            where: {
                voteban_id: votebanId
            }
        });

        await VoteBan.destroy({
            where: {
                id: votebanId
            }
        });

        log.debug('Votes and Voteban destroyed');
    };

    const addVote = async (chatId, fromId, banUser, voteValue) => {
        const votingUser = await findUserById(fromId);

        let vote = await Vote.findOne({
            where: {
                user_id: votingUser.id
            }
        });

        if (vote) {
            await replyTo(
                chatId,
                banUser.Voteban.post_id,
                `[Утверждение]\r\n@${votingUser.username} глупый мешок с мясом ты уже голосовал!`
            );
            return false;
        }

        vote = await Vote.create({
            vote: voteValue,
            user_id: votingUser.id,
            voteban_id: banUser.Voteban.id
        });

        if (voteValue === voteEnum.yes) {
            await replyTo(
                chatId,
                banUser.Voteban.post_id,
                `@${votingUser.username} решил уничтожить мешок с мясом`
            );
        } else {
            await replyTo(
                chatId,
                banUser.Voteban.post_id,
                `@${votingUser.username} решил пощадить мешок с мясом`
            );
        }

        return true;
    };

    const createVoteBan = async (chatId, messageId, user) => {
        const voteBan = await VoteBan.create({});
        await user.setVoteban(voteBan);

        const message = await bot.sendMessage(
            chatId,
            `[Утверждение]\r\nГолосование за аннигиляцию мешка с мясом @${user.username}`
            , {
                reply_to_message_id: messageId,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Уничтожить',
                                callback_data: JSON.stringify({
                                    vote: voteEnum.yes,
                                    id: user.telegram_id
                                })
                            },
                            {
                                text: 'Пощадить',
                                callback_data: JSON.stringify({
                                    vote: voteEnum.no,
                                    id: user.telegram_id
                                })
                            } // ебаный пиздец
                        ]
                    ]
                }
            }
        );

        voteBan.post_id = message.message_id;
        return voteBan.save();
    };

    const kickUser = async (chatId, user) => {
        await bot.kickChatMember(chatId, user.telegram_id);
        await bot.sendMessage(chatId, `Мешок с мясом ${user.username} успешно аннигилирован!`);
        await bot.unbanChatMember(chatId, user.telegram_id);
        user.Counter.kicks += 1;

        return user.Counter.save();
    };

    bot.on('callback_query', async (callback) => {
        const data = Transform.transfromCallback(callback);
        const inline = data.inline_data;
        const chatId = data.message.chat.id;

        const userId = inline.id;
        const banUser = await findUserById(userId);

        const voteResult = await addVote(
            chatId,
            callback.from.id,
            banUser,
            inline.vote
        );

        const votes = await banUser.Voteban.getVotes();
        let ban = 0, unban = 0; //eslint-disable-line
        votes.forEach(v => v.vote === voteEnum.yes ? ban += 1 : unban += 1); //eslint-disable-line

        if (ban > 5) {
            await kickUser(chatId, banUser);
            await deleteVoteBan(banUser.Voteban.id);
        } else if (unban > 5) {
            await bot.sendMessage(chatId, `Мешок с мясом ${banUser.username} будет жить!`);
            await deleteVoteBan(banUser.Voteban.id);
        }
    });

    bot.onText(/\/voteblan (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const username = match[1].replace('@', '');
        const user = await findUser(username);

        if (!user) {
            await replyTo(
                chatId,
                messageId,
                `Мешок с мясом по имени @${username} не найден`
            );
            return;
        }
        if (user.is_bot) {
            await replyTo(
                chatId,
                messageId,
                'Мешок с мясом не может блокировать ботов'
            );
            return;
        }

        if (user.Voteban) {
            const duration = getTimeDuration(user.Voteban.created_at);
            if (duration.days() >= 1) {
                await deleteVoteBan(user.Voteban.id);
                await createVoteBan(chatId, messageId, user);
                return;
            }

            await replyTo(
                chatId,
                messageId,
                'Дело этого мешка с мясом уже рассматривается!'
            );

            return;
        }

        if (user.is_admin) {
            await replyTo(
                chatId,
                messageId,
                'Я сделаю вид, что не видел этого'
            );

            return;
        }

        if (user.username === msg.from.username) {
            await replyTo(
                chatId,
                messageId,
                'Тупой мешок мяса не может просить о аннигиляции самого себя'
            );

            return;
        }

        await createVoteBan(chatId, messageId, user);
    });
})();
