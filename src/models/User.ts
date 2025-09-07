import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  age: number;
  email?: string;
  mobile?: string;
  address: string;
  aadharCardNumber: number;
  password: string;
  role: 'voter' | 'admin';
  isVoted: boolean;
  // Candidacy fields
  isCandidateApplicant: boolean;
  candidateApplicationStatus: 'pending' | 'approved' | 'rejected' | 'none';
  candidateParty?: string;
  candidateManifesto?: string;
  candidateAppliedAt?: Date;
  candidateApprovedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String
  },
  mobile: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  isVoted: {
    type: Boolean,
    default: false
  },
  // Candidacy fields
  isCandidateApplicant: {
    type: Boolean,
    default: false
  },
  candidateApplicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'none'],
    default: 'none'
  },
  candidateParty: {
    type: String
  },
  candidateManifesto: {
    type: String
  },
  candidateAppliedAt: {
    type: Date
  },
  candidateApprovedAt: {
    type: Date
  }
});

userSchema.pre('save', async function(next) {
  const user = this as IUser;
  
  // Hash the password only if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    
    // Override the plain password with the hashed one
    user.password = hashedPassword;
    next();
  } catch (err) {
    return next(err as Error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // Use bcrypt to compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

const User: Model<IUser> = mongoose.models?.User || mongoose.model<IUser>('User', userSchema);

export default User;
