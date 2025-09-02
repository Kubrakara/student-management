import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
}

const enrollmentSchema: Schema = new Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', 
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', 
    required: true,
  },
}, {
  timestamps: true, 
});

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
export default Enrollment;