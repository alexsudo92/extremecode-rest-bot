const { User, Stat } = require('./../models');

const transformUser = (from) => {
    from.telegram_id = from.id;
    delete from.id;
    return from;
};

const createUser = async (from) => {
    const transformed = transformUser(from);
    const user = await User.create(transformed);
    const stat = await Stat.create({ });

    await user.setStat(stat);
};

module.exports = async (from) => {
    let user = await User.findOne({
        where: {
            telegram_id: from.id
        },
        include: [Stat]
    });

    if (!user) {
        user = createUser(from);
    }

    user.Stat.messages_count += 1;
    await user.Stat.save();
};
