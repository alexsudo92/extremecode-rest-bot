const { bot } = require('./../config');
const { Group } = require('./../models');
const { replyTo } = require('./../util/telegram');
const {
    findGroup,
    findUser,
    findGroupById
} = require('./../util/finders');

module.exports = (() => {
    const groupEnum = Object.freeze({
        invite: 'invite',
        open: 'open'
    });

    const leaveGroup = async (group, user) => {
        if (!group) {
            user.group_id = null;
            await user.save();
        } else {
            group.users_count -= 1;
            user.group_id = null;
            group.removeUser(user);
            await group.save();
            await user.save();
        }
    };

    const deleteGroup = async (groupName) => {
        const group = await findGroup(groupName);
        if (group) {
            await group.destroy();
        }
    };

    const joinGroup = async (group, user) => {
        group.addUser(user);
        group.users_count += 1;
        user.group_id = group.id;
        await user.save();
        await group.save();
    };

    bot.onText(/\/groupcreate (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const groupName = match[1];

        const user = await findUser(msg.from.username);
        let group = await findGroup(groupName);

        if (!user.is_admin) {
            await replyTo(
                chatId,
                messageId,
                '[Утверждение]\r\nМешок с мясом, ты не состоишь в группировке "Админстраторы"'
            );
            return;
        }

        if (user.group_id) {
            await replyTo(
                chatId,
                messageId,
                '[Утверждение]\r\nТупой мешок с мясом, ты уже состоишь в группировке'
            );
            return;
        }

        if (group) {
            await replyTo(
                chatId,
                messageId,
                `[Утверждение]\r\nТупой мешок, группировка под названием '${groupName}' уже существует`
            );
            return;
        }

        if (groupName.length > 15) {
            await replyTo(
                chatId,
                messageId,
                'Глупый мешок с мясом, я не могу вместить такое длинное название!'
            );
            return;
        }

        group = await Group.create({ name: groupName, user_id: user.id, mode: groupEnum.open });
        await joinGroup(group, user);
        user.setGroup(group);

        await replyTo(
            chatId,
            messageId,
            `[Утверждение]\r\nСоздана группировка '${groupName}'`
        );
    });

    bot.onText(/\/groupremove/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        const user = await findUser(msg.from.username);
        const group = await findGroupById(user.group_id);
        if (user.id !== group.user_id) {
            await replyTo(
                chatId,
                messageId,
                `[Утверждение]\r\nГлупый мешок с мясом, ты не создатель группировки '${group.name}'`
            );
            return;
        }

        if (!user.group_id) {
            await replyTo(
                chatId,
                messageId,
                '[Утверждение]\r\nГлупый мешок с мясом, ты не состоишь в группировке'
            );
            return;
        }

        await deleteGroup(group.name);
        await leaveGroup(undefined, user);

        await replyTo(
            chatId,
            messageId,
            `[Утверждение]\r\nГруппировка под названием '${group.name}' успешно аннигилирована!`
        );
    });

    bot.onText(/\/groupjoin (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        const user = await findUser(msg.from.username);
        const group = await findGroup(match[1]);

        if (user.group_id) {
            await replyTo(
                chatId,
                messageId,
                '[Утверждение]\r\nТупой мешок с мясом, ты уже состоишь в группировке'
            );
            return;
        }

        if (group.mode === groupEnum.invite) {
            await replyTo(
                chatId,
                messageId,
                `[Утверждение]\r\nМешки с мясом могут войти в группировку '${group.name}' только с разрешения`
            );
            return;
        }

        await joinGroup(group, user);

        await replyTo(
            chatId,
            messageId,
            `[Утверждение]\r\nТы вошел в группировку '${group.name}'`
        );
    });

    bot.onText(/\/groupinvite (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        const member = await findUser(match[1].replace('@', ''));
        const user = await findUser(msg.from.username);
        const group = await findGroupById(user.group_id);

        if (user.id !== group.user_id) {
            await replyTo(
                chatId,
                messageId,
                `[Утверждение]\r\nГлупый мешок с мясом, ты не создатель группировки '${group.name}'`
            );
            return;
        }

        if (!member) {
            await replyTo(
                chatId,
                messageId,
                `Мешок с мясом по имени ${match[1]} не найден`
            );
            return;
        }

        await joinGroup(group, member);

        await replyTo(
            chatId,
            messageId,
            `Мешок с мясом по имени ${match[1]} добавлен в группировку '${group.name}'`
        );
    });

    bot.onText(/\/groupleave/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        const user = await findUser(msg.from.username);
        const group = await findGroupById(user.group_id);

        if (!user.group_id) {
            await replyTo(
                chatId,
                messageId,
                `[Утверждение]\r\nГлупый мешок с мясом, ты не создатель группировки '${group.name}'`
            );
            return;
        }

        await leaveGroup(group, user);

        if (group.users_count === 0) {
            await deleteGroup(group.name);
            await replyTo(
                chatId,
                messageId,
                `[Информация]\r\nПоследний мешок с мясом покинул группировку '${group.name}'`
            );
        }

        await replyTo(
            chatId,
            messageId,
            `[Утверждение]\r\nГлупый мешок с мясом, ты не создатель группировки '${group.name}'`
        );
    });

    bot.onText(/\/groupkick (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        const user = await findUser(msg.from.username);
        const member = await findUser(match[1].replace('@', ''));
        const group = await findGroupById(user.group_id);

        if (user.id !== group.user_id) {
            await replyTo(
                chatId,
                messageId,
                `[Утверждение]\r\nГлупый мешок с мясом, ты не создатель группировки '${group.name}'`
            );
            return;
        }

        if (!member) {
            await replyTo(
                chatId,
                messageId,
                `Мешок с мясом по имени ${match[1]} не найден`
            );
            return;
        }

        await leaveGroup(group, member);
        await replyTo(
            chatId,
            messageId,
            `[Утверждение]\r\nМешок с мясом по имени ${match[1]} успешно аннигилирован из группировки '${group.name}'`
        );
    });

    bot.onText(/\/groupmode (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        const user = await findUser(msg.from.username);
        const group = await findGroupById(user.group_id);
        const mode = match[1];

        if (user.id !== group.user_id) {
            await replyTo(
                chatId,
                messageId,
                `[Утверждение]\r\nГлупый мешок с мясом, ты не создатель группировки '${group.name}'`
            );
            return;
        }

        if (!group) {
            await replyTo(
                chatId,
                messageId,
                '[Утверждение]\r\nТупой мешок, ты не состоишь в группировке'
            );
            return;
        }

        if (mode === groupEnum.invite) {
            group.mode = groupEnum.invite;
        } else if (mode === groupEnum.open) {
            group.mode = groupEnum.open;
        } else {
            await replyTo(
                chatId,
                messageId,
                '[Утверждение]\r\nГлупый мешок с мясом, такого режима нет'
            );
        }

        await replyTo(
            chatId,
            messageId,
            `[Информация]\r\nМешки с мясом могут вступить в группировку '${group.name}' только с разрешения`
        );

        await group.save();
    });
})();
