import mongoose, { Document, Model } from 'mongoose';

export interface IVote {
  user: mongoose.Types.ObjectId;
  votedAt: Date;
}

export interface ICandidate extends Document {
  name: string;
  party: string;
  age: number;
  votes: IVote[];
  voteCount: number;
  // Reference to user who applied (if created from user application)
  applicantUser?: mongoose.Types.ObjectId;
  manifesto?: string;
  isFromUserApplication: boolean;
}

const candidateSchema = new mongoose.Schema<ICandidate>({
  name: {
    type: String,
    required: true
  },
  party: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  voteCount: {
    type: Number,
    default: 0
  },
  // Reference to user who applied (if created from user application)
  applicantUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  manifesto: {
    type: String
  },
  isFromUserApplication: {
    type: Boolean,
    default: false
  }
});

const Candidate: Model<ICandidate> = mongoose.models?.Candidate || mongoose.model<ICandidate>('Candidate', candidateSchema);

export default Candidate;
