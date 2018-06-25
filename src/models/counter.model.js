module.exports = (sequelize, DataTypes) => {
    const Counter = sequelize.define('Counter', {
        messages: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        audios: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        voices: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        files: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        links: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        images: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        stickers: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        kicks: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'counters'
    });

    Counter.associate = (models) => {
        Counter.belongsTo(models.User);
    };

    return Counter;
};
