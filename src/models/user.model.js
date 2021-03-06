module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        chat_id: {
            type: DataTypes.STRING, // not int, cuz out of range
            allowNull: false
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        telegram_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 150]
            }
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'users'
    });

    User.associate = (models) => {
        User.hasOne(models.Vote);
        User.hasOne(models.VoteBan);
        User.hasOne(models.Counter);
        User.hasOne(models.Group);
    };

    return User;
};
