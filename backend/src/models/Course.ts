import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
}

const courseSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Ders adı zorunludur.'],
    unique: true,
    trim: true,
  }
}, {
  timestamps: true
});

const Course = mongoose.model<ICourse>('Course', courseSchema);
export default Course;