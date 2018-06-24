module.exports = (sequelize, DataType) => {
    const voteBan = sequelize.define('Votebans', {
        post_id: {
            type: DataType.INTEGER
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'votebans'
    });

    voteBan.associate = (models) => {
        voteBan.hasMany(models.Vote);
    };

    return voteBan;
};
