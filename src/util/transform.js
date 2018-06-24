
const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const shift = (item) => item.split('.').shift();

exports.transformArray = (arr) => {
    const result = [];
    if (arr instanceof Array) {
        arr.forEach(index => {
            result.push(capitalize(shift(index)));
        });
    } else {
        throw Error('Argument must be type of Array');
    }

    return result;
};

exports.transfromCallback = (callback) => {
    const transformed = {
        chat_instance: callback.chat_instance,
        inline_data: JSON.parse(callback.data),
        from: {
            first_name: callback.from.first_name,
            id: callback.from.id,
            is_bot: callback.from.is_bot,
            language_code: callback.from.language_code,
            last_name: callback.from.last_name,
            username: callback.from.username
        },
        id: callback.id,
        message: {
            chat: callback.message.chat,
            date: callback.message.date,
            text: callback.message.text
        }
    };

    return transformed;
};

/**
 * Вспомогательная функция которая преобразует имена объектов
 * для экспорта, путем отбрасывания всего что находится после точки
 * (user.model => User)
 * P.S.
 * Люблю JS, как собака палку
 */
exports.transformObject = (obj) => {
    Object.keys(obj).forEach(key => {
        const name = capitalize(shift(key));
        obj[name] = obj[key];
        delete obj[key];
    });

    return obj;
};
