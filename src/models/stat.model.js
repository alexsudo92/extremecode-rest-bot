const { Models } = require('./');

module.exports = (sequelize, DataTypes) => {
    const Stat = sequelize.define('Stat', {
        messages_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        rating: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'stats'
    });

    Stat.associate = (models) => {
        Stat.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return Stat;
};
