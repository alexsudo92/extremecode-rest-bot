module.exports = (sequelize, DataTypes) => {
    const Vote = sequelize.define('Vote', {
        vote: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: false
            }
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'votes'
    });

    Vote.associate = (models) => {
        Vote.belongsTo(models.User);
        Vote.belongsTo(models.VoteBan);
    };

    return Vote;
};
