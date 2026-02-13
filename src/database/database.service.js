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
export const findById=async({
    model,
    id
})=>{
    let doc=await model.findById(id)
    return doc


    
}