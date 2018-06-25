const { User, Counter } = require('./../models');

const transformUser = (from) => {
    from.telegram_id = from.id;
    delete from.id;
    return from;
};

const createUser = async (from) => {
    const transformed = transformUser(from);
    const user = await User.create(transformed);
    const counter = await Counter.create({ });

    await user.setCounter(counter);
    return user;
};

const countAndSave = async (msg, user) => {
    if (msg.text && msg.entities) {
        if (msg.entities.shift().type === 'url') {
            user.Counter.links += 1;
        }
    } else if (msg.text) {
        user.Counter.messages += 1;
    }

    if (msg.photo) {
        user.Counter.images += 1;
    }

    if (msg.sticker) {
        user.Counter.stickers += 1;
    }

    if (msg.voice) {
        user.Counter.voices += 1;
    }

    if (msg.audio) {
        user.Counter.audios += 1;
    }

    if (msg.document) {
        user.Counter.files += 1;
    }

    return user.Counter.save();
};

const updateIfRequired = async (from, user) => {
    let changed = false;

    if (from.first_name !== user.first_name) {
        user.first_name = from.first_name;
        changed = true;
    }

    if (from.last_name !== user.last_name) {
        user.last_name = from.last_name;
        changed = true;
    }

    if (from.username !== user.username) {
        user.username = from.username;
        changed = true;
    }

    if (from.is_admin !== user.is_admin) {
        user.is_admin = from.is_admin;
        changed = true;
    }
    if (from.is_bot !== user.is_bot) {
        user.is_bot = from.is_bot;
        changed = true;
    }

    if (changed) {
        await user.save();
    }

    return changed;
};

module.exports = async (msg) => {
    const { from } = msg;

    let user = await User.findOne({
        where: {
            telegram_id: from.id
        },
        include: [Counter]
    });

    if (!user) {
        user = await createUser(from);
        user.Counter = await user.getCounter();
    } else {
        await updateIfRequired(from, user);
    }

    return countAndSave(msg, user);
};
