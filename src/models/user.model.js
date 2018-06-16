const { Models } = require('./');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
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
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 150]
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_bot: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'users'
    });

    User.associate = (models) => {
        User.hasOne(models.Stat, { foreignKey: 'user_id' });
    };

    return User;
};
