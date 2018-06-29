const {
    User,
    Group,
    VoteBan,
    Counter
} = require('./../models');

exports.findUser = async (username) => {
    const user = await User.findOne({
        where: {
            username: username
        },
        include: [Group, Counter, VoteBan]
    });
    return user;
};

exports.findGroup = async (name) => {
    const group = await Group.findOne({
        where: {
            name: name
        }
    });

    return group;
};

exports.findGroupById = async (groupId) => {
    const group = await Group.findOne({
        where: {
            id: groupId
        }
    });
    return group;
};

exports.findUserById = async (userId) => {
    const user = await User.findOne({
        where: {
            telegram_id: userId
        },
        include: [VoteBan, Counter]
    });
    return user;
};
