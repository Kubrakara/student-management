import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose şeması
const studentSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Ad alanı zorunludur.'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Soyadı alanı zorunludur.'],
    trim: true,
  },
  birthDate: {
    type: Date,
    required: [true, 'Doğum tarihi zorunludur.'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Doğum tarihi bugünden sonraki bir tarih olamaz!'
    }
  }
}, {
  timestamps: true 
});

const Student = mongoose.model<IStudent>('Student', studentSchema);
export default Student;