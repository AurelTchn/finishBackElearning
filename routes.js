const express = require('express')
const multer = require('multer')
const crypto = require('crypto')
const path = require('path')

const dfController = require('./controllers/defaultController')
const apprenantController = require('./controllers/apprenantController')
const formateurController = require('./controllers/formateurController')
const commentaireController = require('./controllers/commentaireController')
const coursController = require('./controllers/coursController')
const moduleController = require('./controllers/moduleController')
const recuController = require('./controllers/recuController')
const sinscrireController = require('./controllers/sinscrireController')
const support_coursController = require('./controllers/support_coursController')
const authentificateToken = require('./controllers/autentificateToken')
const adminController = require('./controllers/adminController')
const statistiquesController = require('./controllers/statistiquesController')


const router = express.Router()

//GESTION DES IMAGES
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fieldName = file.fieldname.toLowerCase()
        let destination = ""
        switch (fieldName) {
            case "photo":
                destination = "uploads/photo/"
                break
            case "photoprof":
                destination = "uploads/photoprof"
                break
            case "photomodule":
                destination = "uploads/photomodule"
                break
            case "supportcours":
                destination = "uploads/supportcours"
                break
            case "recu":
                destination = "uploads/recu"
                break
            default:
                destination = "uploads/"
        }
        cb(null, destination)
    },
    /* filename: (req, file, cb) => {
        const fieldName = file.fieldname.toLowerCase()
        const filename = crypto.randomBytes(8).toString('hex')
        cb(null, fieldName + filename + ".png")
    } */
    filename: (req, file, cb) => {
        const fieldName = file.fieldname.toLowerCase();
        const fileExt = path.extname(file.originalname); // Obtenir l'extension du fichier d'origine
        const filename = `${fieldName}-${crypto.randomBytes(8).toString('hex')}${fileExt}`;
        cb(null, filename);
    }
});
const upload = multer({ storage: storage });

//DEFAULT ROUTE
router.get('/', dfController.defaultRoute)


//ROUTES APPRENANT
router.post('/confirm_mail_apprenant', upload.fields([{ name: "photo", maxCount: 1 }]), apprenantController.sendConfirmMail)
router.post('/createApprenant', apprenantController.create)
router.post('/loginApprenant', apprenantController.login)
router.post('/updateNomPrenomApprenant', authentificateToken.authentificateToken, apprenantController.updateNomPrenom)
router.post('/updatepasswordApprenant', authentificateToken.authentificateToken, apprenantController.updatePassword)
router.post('/envoieCodeEmailApprenant', authentificateToken.authentificateToken, apprenantController.sendCodeMail)
router.post('/modifierMailApprenant', authentificateToken.authentificateToken, apprenantController.modifyEmail)
router.post('/afficherUnApprenant', authentificateToken.authentificateToken, apprenantController.getOneApprenant)
router.get('/afficherToutApprenant',authentificateToken.authentificateToken, apprenantController.getAllApprenant)
router.post('/supprimerUnApprenant', authentificateToken.authentificateToken, apprenantController.deleteApprenant)


//ROUTES FORMATEUR
router.post('/decodeToken', formateurController.decodeToken)
router.post('/confirm_mail_formateur', upload.fields([{ name: "photoprof", maxCount: 1 }]), apprenantController.sendConfirmMail)
router.post('/createFormateur', upload.fields([{ name: "photoprof", maxCount: 1 }]), formateurController.create)
router.post('/loginFormateur', formateurController.login)
router.post('/updateNomPrenomFormateur', upload.fields([{ name: "photoprof", maxCount: 1 }]), formateurController.updateNomPrenomAutre)
router.post('/updatepasswordformateur', authentificateToken.authentificateToken, formateurController.updatePassword)
router.post('/envoieCodeEmailformateur', authentificateToken.authentificateToken, formateurController.sendCodeMail)
router.post('/modifierMailformateur', authentificateToken.authentificateToken, formateurController.modifyEmail)
router.post('/afficherUnFormateur', authentificateToken.authentificateToken, formateurController.getOneFormateur)
router.post('/afficherUnFormateurid', formateurController.getOneFormateurId)
router.get('/afficherToutFormateur', formateurController.getAllFormateur)
router.post('/supprimerUnFormateur', authentificateToken.authentificateToken, formateurController.deleteFormateur)

//ROUTES ADMIN
router.post('/creeradmin', adminController.create)
router.post('/loginadmin', adminController.login)
router.post('/voirunadmin', authentificateToken.authentificateToken, adminController.getOneAdmin)

//ROUTES COMMENTAIRES
router.post('/creercommentaire', authentificateToken.authentificateToken, commentaireController.create)
router.post('/voirUnCommentaire', commentaireController.getOneCommentaire)
router.post('/supprimerUnCommentaire', commentaireController.deleteApprenant)
router.post('/affichertoutcommentaire', commentaireController.afficherAllCommentaire)

//ROUTES COURS 
router.post('/creeruncours', coursController.create)
router.get('/affichertoutcours', coursController.getAllCours)
router.post('/afficherUncours', coursController.getOneCours)
router.post('/supprimerUnCours', coursController.deleteCours)
router.post('/affcoursva', coursController.viewcours)

//ROUTES MODULES
router.post('/creerUnModule', upload.fields([{ name: "photomodule", maxCount: 1 }]), authentificateToken.authentificateToken, moduleController.create)
router.post('/affichiertoutmoduleformateur', authentificateToken.authentificateToken, moduleController.getAllModulesOnFormateur)
router.post('/affichertoutmoduleformateuretude', moduleController.getAllModulesOnFormateurEtude)
router.post('/supprimerUnModule', moduleController.deleteModules)
router.post('/updatemodule', upload.fields([{ name: "photomodule", maxCount: 1 }]), authentificateToken.authentificateToken, moduleController.updatedmodule)
router.get('/affichertoutout', moduleController.affichertoutout)
router.post('/afmodulehaut', moduleController.vewmodules)


//ROUTES RECU
router.post('/creerUnRecu', authentificateToken.authentificateToken, recuController.create)
router.post('/afficherToutRecu', authentificateToken.authentificateToken, recuController.afficherToutRecu)

//ROUTES S'INSCRIRE A UN MODULE
router.post('/creerUneInscription' , authentificateToken.authentificateToken, sinscrireController.create)
router.post('/verifierinscriptionmodule', authentificateToken.authentificateToken, sinscrireController.verif_iscri_module)

//ROUTES SUPPORT COURS
router.post('/ajouterSupportCours', upload.fields([{ name: "supportcours", maxCount: 1 }]), support_coursController.create)
router.post('/affichertoutsupport', support_coursController.getAllSupport)
router.post('/supprimersupport', support_coursController.supprimersupport)

//Statisque Router
router.post('/nommbremodulesuiviformateur', authentificateToken.authentificateToken, statistiquesController.nombre_apprenant_module)
router.post('/nombremoduleformateur', authentificateToken.authentificateToken, statistiquesController.nombre_module)
router.post('/nombrecommentaire', authentificateToken.authentificateToken, statistiquesController.nombre_commentaires)
router.post('/nombreapprenantparmodule', authentificateToken.authentificateToken, statistiquesController.nombre_apprenant_par_modules)
router.post('/courbeapprenant', statistiquesController.courbe_apprenants)
router.post('/courbeformateur', statistiquesController.courbe_formateurs)


//ROUTER RECHERCHER
router.post('/rechercher', statistiquesController.rechercher)
router.post('/comptermodule', statistiquesController.compter)



module.exports = router;