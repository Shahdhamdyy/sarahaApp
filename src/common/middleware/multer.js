// import multer from 'multer'
// import fs from 'node:fs'


// export let extensions = {
//     image: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
//     video: ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"],
//     pdf: ["application/pdf"]

// }
// export let multer_local = ({ customPath, allowedExtensions } = { customPath: "general" }) => {
//     let storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//             let path = `uploads/${customPath}`
//             if (!fs.existsSync(path)) {
//                 fs.mkdirSync(path, { recursive: true })
//             }
//             cb(null, path)
//         },
//         filename: function (req, file, cb) {
//             let prefix = Date.now()
//             let name = prefix + "-" + file.originalname
//             cb(null, name)
//         }


//     })
//     let fileFilter = function (req, file, cb) {
//         if (!allowedExtensions.includes(file.mimetype)) {
//             cb(null, false)
//         }
//         cb(null, true)
//     }
//     return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })
// }import multer from "multer"
import fs from "node:fs"
import multer from "multer"
export const extensions = {
    image: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
    video: ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"],
    pdf: ["application/pdf"]
}

export const multer_local = ({ customPath, allowedExtensions } = { customPath: "general" }) => {

    const storage = multer.diskStorage({

        destination: function (req, file, cb) {
            const path = `uploads/${customPath}`

            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true })
            }

            cb(null, path)
        },

        filename: function (req, file, cb) {
            const prefix = Date.now()
            const name = `${prefix}-${file.originalname}`
            cb(null, name)
        }

    })

    const fileFilter = function (req, file, cb) {

        if (allowedExtensions && !allowedExtensions.includes(file.mimetype)) {
            return cb(new Error("Invalid file type"), false)
        }

        cb(null, true)
    }

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 }
    })
}