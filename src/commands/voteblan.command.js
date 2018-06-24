const { bot } = require('./../config');
const { User, Vote, VoteBan } = require('./../models');
const { Transform, Logger } = require('./../util');
const moment = require('moment');

const log = Logger(module);

module.exports = (() => {
    const findUser = async (username) => {
        const user = await User.findOne({
            where: {
                username: username
            },
            include: [VoteBan]
        });
        return user;
    };

    const deleteVote = async (votebanId) => {
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

    bot.on('callback_query', async (callback) => {
        const data = Transform.transfromCallback(callback);
        const chatId = data.message.chat.id;

        const dataName = data.data.split(',');
        const banUser = await findUser(dataName[1]);

        if (dataName[0] === 'unban') {
            await bot.sendMessage(chatId, `@${callback.from.username} решил пощадить мешок с мясом`, {
                reply_to_message_id: banUser.Voteban.post_id
            });
        } else {
            const voteUser = await findUser(data.from.username);

            const vote = await Vote.findOne({
                where: {
                    user_id: voteUser.id
                }
            });

            if (vote) {
                await bot.sendMessage(chatId, 'Глупый мешок с мясом ты уже голосовал!');
                return;
            }
            const userVote = await Vote.create({ vote: 'yes', user_id: voteUser.id, voteban_id: banUser.Voteban.id });
            voteUser.setVote(userVote);

            await bot.sendMessage(chatId, `@${callback.from.username} решил уничтожить мешок с мясом`, {
                reply_to_message_id: banUser.Voteban.post_id
            });

            const votes = await banUser.Voteban.getVotes();

            if (votes.length > 5) {
                await bot.kickChatMember(chatId, banUser.telegram_id);
                await bot.sendMessage(chatId, 'Мешок с мясом успешно аннигилирован!');
                await bot.unbanChatMember(chatId, banUser.telegram_id);

                await deleteVote(banUser.Voteban.id);
            }
        }
    });

    bot.onText(/\/voteblan (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const username = match[1].replace('@', '');
        const user = await findUser(username);
        
        //TODO: Сделать проверку на время
        if (user.Voteban) {
            await bot.sendMessage(chatId, 'Дело этого мешка с мясом уже рассматривается!', {
                reply_to_message_id: messageId
            });
            return;
        }
        
        if (!user) {
            await bot.sendMessage(chatId, `Мешок с мясом по имени ${match[1]} не найден`, {
                reply_to_message_id: messageId
            });
            return;
        }

        if (user.is_admin === true) {
            await bot.sendMessage(chatId, 'Я сделаю вид, что не видел этого', {
                reply_to_message_id: messageId
            });
            return;
        }

        if (!user.VoteBan) {
            const voteBan = await VoteBan.create({});
            user.setVoteban(voteBan);
        }

        const message = await bot.sendMessage(chatId, `[Утверждение]\r\nМешок с мясом хочет уничтожить ${match[1]}`, {
            reply_to_message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Уничтожить',
                            callback_data: `ban,${username}`
                        },
                        {
                            text: 'Пощадить',
                            callback_data: `unban,${username}`
                        }
                    ]
                ]
            }
        });

        await VoteBan.update({ post_id: message.message_id }, { where: { user_id: user.id } });
    });
})();
