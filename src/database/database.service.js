export const findOne = async ({
    model,
    filter = {},
    select = '',
    options = {}
}) => {

    let query = model.findOne(filter)

    if (select.length) {
        query = query.select(select)
    }

    if (options.populate) {
        query = query.populate(options.populate)
    }

    const doc = await query

    return doc
}
export const findAll = async ({
    model,
    filter = {},
    select = '',
    options = {}
}) => {
    let docs = await model.find(filter)
    if (select.length) {
        docs.select(select)
    }
    if (options.populate) {
        docs.populate(options.populate)
    }
    return docs

}
export const findOneAndDelete = async ({
    model,
    filter = {}
}) => {
    return await model.findOneAndDelete(filter)
}
export const findOneAndUpdate = async ({
    model,
    filter = {},
    update = {},
    options = {}
}) => {
    return await model.findOneAndUpdate(filter, update, options)
}
export const insertOne = async ({
    model,
    data = {}
}) => {
    return await model.insertOne(data)
}
export const insertMany = async ({
    model,
    data = []
}) => {
    return await model.insertMany(data)
}
export const findById = async ({
    model,
    id
}) => {
    return await model.findById(id)

} 