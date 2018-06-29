module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 15]
            }
        },
        users_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        mode: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'groups'
    });

    Group.associate = (models) => {
        Group.belongsToMany(models.User, { as: 'Users', through: 'groups_users' });
    };

    return Group;
};
