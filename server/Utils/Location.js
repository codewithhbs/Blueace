// vendorService.js
const Vendor = require('../Model/vendor.Model');

// Fetch vendor by ID
exports.fetchVendorFromDB = async (vendorId) => {
  try {
    const vendorData = await Vendor.findById(vendorId);
    if (!vendorData) {
      return null; // No vendor found
    }
    return vendorData;
  } catch (error) {
    console.error("Error fetching vendor:", error);
    throw error; // Rethrow for controller to handle
  }
};

// Save/update vendor's last location
exports.saveVendorLastLocation = async (vendorId, location) => {
  try {
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { 
        $set: { 
          lastLocation: location, 
          updatedAt: new Date() 
        } 
      },
      { new: true, upsert: true } // new: return updated doc, upsert: create if not exists
    );

    return updatedVendor;
  } catch (error) {
    console.error("Error saving vendor location:", error);
    throw error;
  }
};
