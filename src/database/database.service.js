export const findOne = async ({
    model,//=userModel
    filter = {},//=={email,password,provider}
    select = '',//-password,-id
    options = {}
}) => {
    let doc = await model.findOne(filter)
    if (select.length) {
        doc.select(select)
    }
    if (options.populate) {
        doc.populate(options.populate)
    }


}
