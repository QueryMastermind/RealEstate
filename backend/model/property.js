import { Schema, model } from "mongoose";

const PropertySchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    default: "Default Property Name" 
  },
  type: { 
    type: String, 
    enum: ["Residential", "Commercial", "Industrial", "Land"], 
    default: "Residential" 
  },
  address: {
    street: { type: String, default: "123 Default Street" },
    city: { type: String, required: true, default: "Default City" },
    state: { type: String, default: "Default State" },
    zipCode: { type: String, default: "00000" },
    country: { type: String, required: true, default: "Default Country" }
  },
  size: { 
    type: Number, 
    default: 1000,
    min: [0, "Size cannot be negative"] 
  },
  bedrooms: { 
    type: Number, 
    default: 2,
    min: [0, "Bedrooms cannot be negative"] 
  },
  bathrooms: { 
    type: Number, 
    default: 1,
    min: [0, "Bathrooms cannot be negative"] 
  },
  price: { 
    type: Number, 
    required: true,
    default: 50000,
    min: [0, "Price cannot be negative"] 
  },
  status: { 
    type: String, 
    enum: ["Pending", "Approved"], 
    default: "Pending" 
  },
  seller: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  managementCompany: { 
    type: String, 
    default: "Default Management Company" 
  },
  managementFee: { 
    type: Number, 
    default: 100,
    min: [0, "Management fee cannot be negative"] 
  },
  leaseTerms: { 
    type: String, 
    default: "Default lease terms apply." 
  },
  maintenanceSchedule: { 
    type: String, 
    default: "Monthly maintenance required." 
  },
  serviceContracts: { 
    type: [String], 
    enum: ["Cleaning", "Security", "Maintenance", "Utilities"],
    default: ["Cleaning", "Security"] 
  },
  financialReports: { 
    type: [{ 
      description: String, 
      amount: Number, 
      date: { type: Date, default: () => new Date() } 
    }], 
    default: [{ description: "Initial deposit", amount: 1000 }] 
  },
  pictures: [{
    url: String,
    public_id: String
  }],
  contactInfo: { 
    type: String, 
    default: "default@email.com" 
  }
}, { 
  timestamps: true // Auto-adds `createdAt` and `updatedAt`
});

export default model("Property", PropertySchema);