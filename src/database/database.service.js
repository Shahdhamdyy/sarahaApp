export const findOne = async ({
    model,//=userModel
    filter = {},//=={email,password,provider}
    select = '',//-password,-id
    options = {}
}) => {
    let doc = await model.findOne(filter)
    console.log(doc);
    if (select.length) {
        doc.select(select)
    }
    if (options.populate) {
        doc.populate(options.populate)
    }
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
    data = {},
    options = {}
}) => {
    return await model.findOneAndUpdate(filter, data, options)
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
    let doc = await model.findById(id)
    return doc



}