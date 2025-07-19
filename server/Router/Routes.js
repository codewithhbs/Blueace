const express = require('express')
const { protect } = require('../Middleware/Protect')
const { register, login, logout, passwordChangeRequest, verifyOtpAndChangePassword, resendOtp, addDeliveryDetails, userDetails, GetDeliveryAddressOfUser, updateDeliveryAddress, getAllUsers, updateUserType, getSingleUserById, updateUser, ChangeOldPassword, deleteUser, updateUserDeactive, universelLogin, getMyDetails, changeAMCStatus, updateIsAMCUser, verifyOtpForRegister, resendVerifyUserOtp, deleteMyAccounSoft } = require('../Controller/Usercontroller')
const router = express.Router()
const upload = require('../Middleware/Multer')
const { createServiceCategory, updateServiceCategory, getServiceCategory, getSingleServiceCategroy, deleteServiceCategory, getServiceCategoryByName, updateIsPopular } = require('../Controller/serviceCategory.Controller')
const { createService, getService, getSingleService, updateService, deleteService, updateServiceActiveStatus, getServiceByName } = require('../Controller/service.Controller')
const { createMarqueeText, getMarqueeText, getSingleMarquee, updateMarqueeText, deleteMarqueeText } = require('../Controller/marqueeText.Controller')
const { createPromotionalBanner, getPromotionalBanner, getSinglePromotionalBanner, updatePromotionalBanner, deletePromotionalBanner, updatePromotionalActiveStatus } = require('../Controller/promotionalBanner.Controller')
const { createFAQBanner, getFAQBanner, getSingleFAQBanner, updateFAQBanner, deleteFAQBanner, updateFAQBannerStatus } = require('../Controller/faqBanner.Controller')
const { createFaqContent, getFaqContent, getSingleFaqContent, deleteFaqContent, updateFaqContent } = require('../Controller/faqContent.Controller')
const { createServiceMainCategory, updateServiceMainCategory, getAllServiceMainCategory, getSingleServiceMainCategory, deleteServiceMainCategory } = require('../Controller/mainServiceCategory.Controller')
const { createBanner, getBanner, getSingleBanner, deleteBanner, updateBanner, updateBannerActiveStatus } = require('../Controller/banner.Controller')
const { registerVendor, vendorLogin, vendorLogout, vendorPasswordChangeRequest, VendorVerifyOtpAndChangePassword, vendorResendOTP, addVendorMember, getAllVendor, updateDeactive, deleteVendor, memberShipPlanGateWay, PaymentVerify, updateVendor, getSingleVendor, updateVendorMember, getMembersByVendorId, updateMember, addNewVendorMember, ChangeOldVendorPassword, updateReadyToWork, sendOtpForVerification, verifyVendor, resendVerifyOtp, deleteVendorMember, updateVendorApp, updateBankDetail, updateTestFieldStatus } = require('../Controller/vendor.Controller')
const { createMemberShipPlan, getAllMemberShipPlan, getSingleMemberShipPlan, deleteMemberShipPlan, updateMemberShipPlan } = require('../Controller/membership.Controller')
const { makeOrder, getAllOrder, updateOrderStatus, deleteOrder, fetchVendorByLocation, AssignVendor, updateBeforWorkImage, updateAfterWorkImage, findOrderById, findOrderByUserId, updateBeforeWorkVideo, updateAfterWorkVideo, AllowtVendorMember, AcceptOrderRequest, makeOrderPayment, verifyOrderPayment, fetchOnlyEmployee, makeOrderFromApp, makeOrderPaymentApp, verifyOrderPaymentApp, updateErrorCodeInOrder, getSingleOrder, getAllDataOfVendor, findOrderByIdApp, serviceDoneOrder, makeOrderFromAdmin, createOrderByChatBot } = require('../Controller/order.Controller')
const { createBlog, getAllBlog, getSingleBlog, updateBlog, deleteBlog, updateBlogIsTranding, getBlogBySlug } = require('../Controller/blog.Controller')
const { getAnylaticalData } = require('../Controller/Dashboard.controller')
const { getAllBills, makeEstimated, UpdateStatusOfBill, deleteBill, updateBill } = require('../Controller/EstimatedBudget.Controller')
const { createGalleryCategory, getAllImageCategory, singleGalleryCategory, deleteGalleryCategory, updateGalleryCategory } = require('../Controller/GalleryCategory.Controller')
const { createGalleryImage, getSingleGalleryImage, getAllGalleryImage, deleteGalleryImage, updateGalleryImage } = require('../Controller/GalleryImage.controller')
const { createContact, getSingleContact, getAllContact, deleteContact } = require('../Controller/Contact.Controller')
const { createWorkingHours, updateWorkingHours, getWorkingHoursById, getAllWorkingHours, deleteWorkingHours } = require('../Controller/workingHours.Controller')
const { createSlotTiming, getAllSlotTiming, updateSlotTiming, deleteSlotTiming, getSlotTimingById } = require('../Controller/slotTiming.Controller')
const { createVendorRating, getAllVendorRatings, getVendorRatingById, updateVendorRating, deleteVendorRating } = require('../Controller/vendorRating.Controller')
const { createScript, getSingleScript, updateScript, getAllScript, deleteScript } = require('../Controller/script.Controller')
const { getCurrentLocationByLatLng, getLatLngByAddress, AutoCompleteAddress } = require('../Controller/Location.Controller')
const { createTerm, getAllTerm, getSingleTerm, deleteTerm, updateTerm } = require('../Controller/Term.Controller')
const { createCommission, getAllCommission, getSingleCommission, updateCommission, deleteCommission } = require('../Controller/Commission.Controller')
const { createWithdrawRequest, getAllWithdraw, getSingleWithdraw, updateWithdrawRequest, deleteWithdrawRequest, getWithdrawByVendorId } = require('../Controller/withdraw.Controller')
const { createCareer, getAllCareers, getCareerById, updateCareer, deleteCareer } = require('../Controller/Career.Controller')
const { createErrorCode, getAllErrorCode, getErrorCodeById, updateErrorCode, deleteErrorCode } = require('../Controller/Error.Controller')
const { createHeading, getAllHeading, updateHeading, deleteHeading, getHeadingById } = require('../Controller/ErrorCodeHeading.Controller')
const S3upload = require('../Middleware/AWS.multer')
const { create_a_issue, get_all_tickets_by_vendor, get_all_tickets_admin, get_single_ticket_by_id, update_ticket_status_by_admin, admin_reply_to_ticket, delete_ticket_by_vendor } = require('../Controller/Ticket_Controller/ticket.controller')
const { createCareerInquiry, getAllCareerInquiry, getSingleCareerInquiry, deleteCareerInquiry } = require('../Controller/CareerInquiry.Controller')
const { createTestVideo, getTestVideos, getVideoById, deleteTestVideo, updateTestVideo, getSingleVideo } = require('../Controller/testVideo.Controller')
const { createTestQuestion, getSingleQuestion, getAllQuestion, updateTestQuestion, deleteQuestion } = require('../Controller/testQuestion.Controller')
const { createCaseStudy, getAllCaseStudy, getSingleCaseStudy, updateCaseStudy, deleteCaseStudy } = require('../Controller/CaseStudy.Controller')
const { creteClientLogo, getAllClientLogos, getSingleClientLogo, updateClientLogo, deleteClientLogo } = require('../Controller/ClientLogo.Controller')
// const { createCart } = require('../Controller/Cart.Controller')

// user routers 

router.post('/Create-User', register)
router.post('/delete-my-account/:id', deleteMyAccounSoft)
router.post('/verify_user_otp/:id', verifyOtpForRegister)
router.post('/resend_verify_user_otp/:id', resendVerifyUserOtp)
router.post('/Login', login)
router.get('/Logout', protect, logout)
router.post('/Password-Change', passwordChangeRequest)
router.post('/Verify-Otp', verifyOtpAndChangePassword)
router.post('/resend-otp', resendOtp)
router.put('/update-user-deactive-status/:_id', updateUserDeactive)
router.put('/update_amcService/:_id', changeAMCStatus)

router.get('/findUser/:_id', universelLogin)
router.get('/find_me', protect, getMyDetails)


router.post('/Add-Delivery-Address', protect, addDeliveryDetails)
// router.get('/user-details', protect, userDetails)
router.get('/get-Delivery-Address', protect, GetDeliveryAddressOfUser)
router.post('/update-Delivery-Address', protect, updateDeliveryAddress)
router.get('/AllUser', getAllUsers)
router.get('/get-single-user/:_id', getSingleUserById)
router.put('/update-user-type/:_id', updateUserType)
router.put('/update-user/:_id', upload.single('userImage'), updateUser)
router.put('/update-old-password/:_id', ChangeOldPassword)
router.delete('/delete-user/:_id', deleteUser)
router.put('/update-user-amc-status/:id', updateIsAMCUser)

// service router here 
router.get('/getAnylaticalData', protect, getAnylaticalData)

// Router for service main category
router.post('/create-service-main-category', createServiceMainCategory);
router.put('/update-service-main-category/:_id', updateServiceMainCategory);
router.get('/get-all-service-main-category', getAllServiceMainCategory)
router.get('/get-single-service-main-category/:_id', getSingleServiceMainCategory)
router.delete('/delete-service-main-category/:_id', deleteServiceMainCategory)

// Router for service category
router.post('/create-service-category', upload.fields([
    { name: 'sliderImage', maxCount: 10 },
    { name: 'icon', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), createServiceCategory);

router.put('/update-service-category/:_id', upload.fields([{ name: 'sliderImage', maxCount: 10 }, { name: 'icon', maxCount: 1 }, { name: 'image', maxCount: 1 }]), updateServiceCategory);
router.get('/get-all-service-category', getServiceCategory)
router.get('/get-single-service-category/:_id', getSingleServiceCategroy)
router.get('/get-service-category-by-name/:name', getServiceCategoryByName)
router.delete('/delete-service-category/:_id', deleteServiceCategory)
router.put('/update-ispopular/:_id', updateIsPopular)

// Router for services

router.post('/create-service', upload.fields([{ name: 'serviceImage', maxCount: 1 }, { name: 'serviceBanner', maxCount: 1 }]), createService)
router.get('/get-all-service', getService)
router.get('/get-single-service/:_id', getSingleService)
router.get('/get-service-by-name/:name', getServiceByName)
router.put('/update-service/:_id', upload.fields([{ name: 'serviceImage', maxCount: 1 }, { name: 'serviceBanner', maxCount: 1 }]), updateService)
router.delete('/delete-service/:_id', deleteService)
router.put('/update-service-active-status/:_id', updateServiceActiveStatus)

// Router for marquee text 

router.post('/create-marquee', createMarqueeText)
router.get('/get-all-marquee', getMarqueeText)
router.get('/get-single-marquee/:_id', getSingleMarquee)
router.put('/update-marquee/:_id', updateMarqueeText)
router.delete('/delete-marquee/:_id', deleteMarqueeText)

// Router for Promotional banner 

router.post('/create-promotional-banner', upload.single('bannerImage'), createPromotionalBanner)
router.get('/get-all-promotional-banner', getPromotionalBanner)
router.get('/get-single-promotional-banner/:_id', getSinglePromotionalBanner)
router.put('/update-promotional-banner/:_id', upload.single('bannerImage'), updatePromotionalBanner)
router.delete('/delete-promotional-banner/:_id', deletePromotionalBanner)
router.put('/update-promotional-banner-active-status/:_id', updatePromotionalActiveStatus)

// Router for FAQ banner 

router.post('/create-faq-banner', upload.single('bannerImage'), createFAQBanner)
router.get('/get-all-faq-banner', getFAQBanner)
router.get('/get-single-faq-banner/:_id', getSingleFAQBanner)
router.put('/update-faq-banner/:_id', upload.single('bannerImage'), updateFAQBanner)
router.delete('/delete-faq-banner/:_id', deleteFAQBanner)
router.put('/update-faq-banner-active-status/:_id', updateFAQBannerStatus)

// Route for faq content 

router.post('/create-faq-content', createFaqContent)
router.get('/get-all-faq-content', getFaqContent)
router.get('/get-single-faq-content/:_id', getSingleFaqContent)
router.delete('/delete-faq-content/:_id', deleteFaqContent)
router.put('/update-faq-content/:_id', updateFaqContent)

// Route for faq content 

router.post('/create-banner', upload.single('bannerImage'), createBanner)
router.get('/get-all-banner', getBanner)
router.get('/get-single-banner/:_id', getSingleBanner)
router.delete('/delete-banner/:_id', deleteBanner)
router.put('/update-banner/:_id', upload.single('bannerImage'), updateBanner)
router.put('/update-banner-active-status/:_id', updateBannerActiveStatus)

// Route for vendor

router.post('/register-vendor', upload.fields([
    { name: 'panImage', maxCount: 1 },
    { name: 'adharImage', maxCount: 1 },
    { name: 'gstImage', maxCount: 1 },
    // { name: 'memberAdharImage', maxCount: 10 } // Allow up to 10 members
]), registerVendor);
router.post('/register-vendor-member/:vendorId', upload.fields([{ name: 'memberAdharImage', maxCount: 10 }]), addVendorMember);
// router.get('/vendor/:vendorId/members', getMembersByVendorId);
router.get('/get-vendor-member/:vendorId', getMembersByVendorId);
router.put('/update-vendor-member/:vendorId/:memberId', upload.single('memberAdharImage'), updateMember);
// Add this route in your routes file (e.g., vendorRoutes.js)
router.post('/add-vendor-member/:vendorId', upload.fields([{ name: 'memberAdharImage', maxCount: 1 }]), addNewVendorMember);
router.post('/vendor-loging', vendorLogin)
router.get('/vendor-logout', vendorLogout)
router.post('/vendor-password-change', vendorPasswordChangeRequest)
router.post('/vendor-verify-otp', VendorVerifyOtpAndChangePassword)
router.post('/vendor-resend-otp', vendorResendOTP)
router.get('/all-vendor', getAllVendor)
router.get('/single-vendor/:_id', getSingleVendor)
router.put('/update-deactive-status/:_id', updateDeactive)
router.put('/update-ready-to-work-status/:_id', updateReadyToWork)
router.delete('/delete-vendor/:_id', deleteVendor)
router.put('/update-vendor/:_id', upload.fields([
    { name: 'panImage', maxCount: 1 },
    { name: 'adharImage', maxCount: 1 },
    { name: 'gstImage', maxCount: 1 },
    { name: 'vendorImage', maxCount: 1 }
]), updateVendor)
router.delete('/delete-vendor-member/:userId/:memberId', deleteVendorMember);

router.put('/update-vendor-old-password/:_id', ChangeOldVendorPassword)

router.put('/verify-account-otp-send', sendOtpForVerification)
router.post('/verify-account', verifyVendor)
router.post('/resend-verify-vendor-otp', resendVerifyOtp)
router.put('/update-vendor_app/:_id', updateVendorApp)

router.put('/update-bank-detail/:vendorId', updateBankDetail)

// routes for vendor working hours

router.post('/create-working-hours/:vendorId', createWorkingHours)
// router.put('/update-working-hours/:_id', updateWorkingHours)
router.put('/update-working-hours/:vendorId', updateWorkingHours)
router.get('/get-single-working-hours/:vendorId', getWorkingHoursById)
router.get('/get-all-working-hours', getAllWorkingHours)
router.delete('/delete-working-hours/:_id', deleteWorkingHours)

// routes for working hours timing 

router.post('/create-timing', createSlotTiming)
router.get('/get-all-timing', getAllSlotTiming)
router.get('/get-single-timing/:_id', getSlotTimingById)
router.put('/update-timing/:_id', updateSlotTiming)
router.delete('/delete-timing/:_id', deleteSlotTiming)

// Routes for membership plan 

router.post('/create-membership-plan', createMemberShipPlan)
router.get('/get-all-membership-plan', getAllMemberShipPlan)
router.get('/get-single-membership-plan/:_id', getSingleMemberShipPlan)
router.delete('/delete-membership-plan/:_id', deleteMemberShipPlan)
router.put('/update-membership-plan/:_id', updateMemberShipPlan)

//Paymnet gateway routes
router.post('/member-ship-plan/:vendorId', memberShipPlanGateWay);
router.post('/payment-verify/:merchantTransactionId', PaymentVerify)

// Order routers

router.post('/make-order', upload.single('voiceNote'), makeOrder)
router.post('/make-order-admin', upload.single('voiceNote'), makeOrderFromAdmin)
router.post('/make-order-app', upload.any(), makeOrderFromApp)
router.get('/get-all-order', getAllOrder)
router.get('/get-order-by-id', findOrderById);
router.get('/get-order-by-id-app', findOrderByIdApp);
router.get('/get-order-by-user-id', findOrderByUserId);
router.get('/get-order-by-id/:id', getSingleOrder)
router.put('/update-order-status/:_id', updateOrderStatus)
router.delete('/delete-order/:_id', deleteOrder)
router.put('/update-befor-work-image/:_id', upload.single('beforeWorkImage'), updateBeforWorkImage)
router.put('/update-after-work-image/:_id', upload.single('afterWorkImage'), updateAfterWorkImage)

// Video Uploadig Routes Start =============== //
router.put('/update-before-work-video/:_id', S3upload.single('beforeWorkVideo'), updateBeforeWorkVideo);
router.put('/update-after-work-video/:_id', S3upload.single('afterWorkVideo'), updateAfterWorkVideo);
// Video Uploadig Routes End =============== //

router.put('/update-allot-vendor-member/:_id', AllowtVendorMember)
router.put('/update-error-code-order/:id', updateErrorCodeInOrder)
router.put('/update-service-done-order/:id', serviceDoneOrder)

// Ticket Raising 
router.post("/create-ticket", S3upload.single("file"), create_a_issue);
router.get("/vendor-tickets/:vendorId", get_all_tickets_by_vendor);
router.get("/admin-tickets", get_all_tickets_admin);
router.get("/ticket/:ticketId", get_single_ticket_by_id);
router.put("/ticket-status/:ticketId", update_ticket_status_by_admin);
router.post("/ticket-reply/:ticketId", admin_reply_to_ticket);
router.delete("/delete-ticket/:ticketId/:vendorId", delete_ticket_by_vendor);

//for fetching vendor for order
router.get('/fetch-Vendor-By-Location', fetchVendorByLocation)
router.get('/fetch-all-employee', fetchOnlyEmployee)
router.post('/assign-Vendor/:orderId/:Vendorid/:type/:workingDay/:workingTime/:workingDate', AssignVendor)
router.put('/update-vendor-order-request/:orderId', AcceptOrderRequest)

// for blog routes 

router.post('/create-blog', upload.fields([{ name: 'smallImage', maxCount: 1 }, { name: 'largeImage', maxCount: 1 }]), createBlog)
router.get('/get-all-blogs', getAllBlog)
router.get('/get-single-blog/:_id', getSingleBlog)
router.put('/update-blog/:_id', upload.fields([{ name: 'smallImage', maxCount: 1 }, { name: 'largeImage', maxCount: 1 }]), updateBlog)
router.delete('/delete-blog/:_id', deleteBlog)
router.put('/update-isTranding/:_id', updateBlogIsTranding)
router.get('/get_blog_by_slug/:slug', getBlogBySlug);

// for esitmated bills routes 
router.get('/get-all-bills', getAllBills)
router.post('/make-Estimated-bills', makeEstimated)
router.put('/update-status-bills/:billId', UpdateStatusOfBill)
router.delete('/delete-Estimated-bills/:billId', deleteBill)
router.put('/update-Estimated-bills/:billId', updateBill)

// gallery category name routes 

router.post('/create-gallery-category-name', createGalleryCategory)
router.get('/get-all-gallery-category-name', getAllImageCategory)
router.get('/get-single-gallery-category-name/:_id', singleGalleryCategory)
router.delete('/delete-gallery-category-name/:_id', deleteGalleryCategory)
router.put('/update-gallery-category-name/:_id', updateGalleryCategory)

// gallery image router 

router.post('/create-gallery-image', upload.single('image'), createGalleryImage)
router.get('/get-single-gallery-image/:_id', getSingleGalleryImage)
router.get('/get-all-gallery-image', getAllGalleryImage)
router.delete('/delete-gallery-image/:_id', deleteGalleryImage)
router.put('/update-gallery-image/:_id', upload.single('image'), updateGalleryImage)

// all contact route here 

router.post('/create-contact', createContact)
router.get('/get-single-contact/:_id', getSingleContact)
router.get('/get-all-contact', getAllContact)
router.delete('/delete-contact/:_id', deleteContact)

// vendor rating routes here 

router.post('/create-vendor-rating', createVendorRating)
router.get('/get-all-vendor-rating', getAllVendorRatings)
router.get('/get-single-vendor-rating/:_id', getVendorRatingById)
router.put('/update-vendor-rating/:_id', updateVendorRating)
router.delete('/delete-vendor-rating/:_id', deleteVendorRating)

// script router here 

router.post('/create-script', createScript)
router.get('/get-single-script/:_id', getSingleScript)
router.get('/get-all-script', getAllScript)
router.put('/update-script/:_id', updateScript)
router.delete('/delete-script/:_id', deleteScript)

// location router here 

router.post('/Fetch-Current-Location', getCurrentLocationByLatLng)
router.get('/geocode', getLatLngByAddress)
router.get('/autocomplete', AutoCompleteAddress)

// term router here 
router.post('/create-term', createTerm)
router.get('/get-all-term', getAllTerm)
router.get('/get-single-term/:id', getSingleTerm)
router.delete('/delete-term/:id', deleteTerm)
router.put('/update-term/:id', updateTerm)

// commission router here 

router.post('/create-commission', createCommission)
router.get('/get-all-commission', getAllCommission)
router.get('/get-single-commission/:id', getSingleCommission)
router.put('/update-commission/:id', updateCommission)
router.delete('/delete-commission/:id', deleteCommission)

// pament of bill route

router.post('/create-bill-payment/:orderId', makeOrderPayment)
// router.post('/verify-bill-payment',verifyOrderPayment)
router.post('/status-payment/:merchantTransactionId', verifyOrderPayment);

router.post('/create-bill-payment-app/:orderId', makeOrderPaymentApp)
// router.post('/verify-bill-payment',verifyOrderPayment)
router.post('/status-payment-app/:merchantTransactionId', verifyOrderPaymentApp);

// withdraw router here 

router.post('/create-withdraw-request', createWithdrawRequest)
router.get('/get-all-withdraw-request', getAllWithdraw)
router.get('/get-single-withdraw-request/:id', getSingleWithdraw)
router.put('/update-withdraw-status/:id', updateWithdrawRequest)
router.delete('/delete-withdraw-request/:withdrawId', deleteWithdrawRequest)
router.get('/get-withdraw-request-by-vendorId/:vendorId', getWithdrawByVendorId)

// career router here 

router.post('/careers', createCareer); // Create
router.get('/careers', getAllCareers); // Read All
router.get('/careers/:id', getCareerById); // Read One
router.put('/careers/:id', updateCareer); // Update
router.delete('/careers/:id', deleteCareer); // Delete

// error code heading router here 
router.post('/create-error-heading', createHeading)
router.get('/get-all-error-heading', getAllHeading)
router.get('/get-single-error-heading/:id', getHeadingById)
router.put('/update-error-heading/:id', updateHeading)
router.delete('/delete-error-heading/:id', deleteHeading)

// error code router here 
router.post('/create-error-code', createErrorCode)
router.get('/get-all-error-code', getAllErrorCode)
router.get('/get-single-error-code/:id', getErrorCodeById)
router.put('/update-error-code/:id', updateErrorCode)
router.delete('/delete-error-code/:id', deleteErrorCode)

//anylitical
router.get('/get-Data-Of-Vendor', getAllDataOfVendor)

// career inquiry 

router.post('/create-career-inquiry', upload.single('resume'), createCareerInquiry)
router.get('/get-all-career-inquiry', getAllCareerInquiry);
router.get('/get-single-career-inquiry/:id', getSingleCareerInquiry);
router.delete('/delete-career-inquiry/:id', deleteCareerInquiry);

// test video rooutes 

router.post('/create-test-video', upload.single('video'), createTestVideo);
// router.get('/get-test video',getTestVideos);
router.get('/get-test-video', getSingleVideo);
router.get('/get-single-test-video/:id', getVideoById);
router.delete('/delete-test-video/:id', deleteTestVideo);
router.put('/update-test-video/:id', upload.single('video'), updateTestVideo);

// test question 

router.post('/create-test-question', createTestQuestion);
router.get('/get-single-question/:id', getSingleQuestion);
router.get('/all-test-question', getAllQuestion);
router.put('/update-test-question/:id', updateTestQuestion);
router.delete('/delete-test-question/:id', deleteQuestion);

router.put('/update-test-field-vendor/:id', updateTestFieldStatus);

// case study routes here 

router.post('/create-case-study', upload.any(), createCaseStudy);
router.get('/get-all-case-study', getAllCaseStudy);
router.get('/get-single-case-study/:id', getSingleCaseStudy);
router.put('/update-case-study/:id', upload.any(), updateCaseStudy);
router.delete('/delete-case-study/:id', deleteCaseStudy);

// client logo routes here 

router.post('/create-client-logo', upload.single('logo'), creteClientLogo);
router.get('/get-all-client-logo', getAllClientLogos);
router.get('/get-single-client-logo/:id', getSingleClientLogo);
router.put('/update-client-logo/:id', upload.single('logo'), updateClientLogo);
router.delete('/delete-client-logo/:id', deleteClientLogo);

// create order from chatbot 

router.post('/create-order-from-chatbot/:OrderId', createOrderByChatBot);


module.exports = router;