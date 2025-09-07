'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Candidate {
  _id: string;
  name: string;
  party: string;
  age: number;
}

interface VoteCount {
  party: string;
  voteCount: number;
}

interface CandidateApplication {
  _id: string;
  name: string;
  age: number;
  aadharCardNumber: number;
  candidateParty: string;
  candidateManifesto: string;
  candidateApplicationStatus: 'pending' | 'approved' | 'rejected';
  candidateAppliedAt: Date;
  candidateApprovedAt?: Date;
}

export default function AdminDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>([]);
  const [candidateApplications, setCandidateApplications] = useState<CandidateApplication[]>([]);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    party: '',
    age: ''
  });
  const [editingCandidate, setEditingCandidate] = useState<{ [key: string]: { name: string; party: string; age: string } }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('📑 Admin Dashboard useEffect triggered:', {
      authLoading,
      user: user ? `User: ${user.name} (${user.role})` : 'No user',
      userRole: user?.role,
      shouldRedirect: !authLoading && (!user || user.role !== 'admin')
    });
    
    if (!authLoading && (!user || user.role !== 'admin')) {
      console.log('❌ Admin Dashboard: Redirecting to login - no user or not admin');
      router.push('/');
      return;
    }

    if (user) {
      console.log('✅ Admin Dashboard: User verified, fetching data...');
      fetchCandidates();
      fetchVoteCounts();
      fetchCandidateApplications();
    }
  }, [user, authLoading, router]);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/candidate');
      setCandidates(response.data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  const fetchVoteCounts = async () => {
    try {
      const response = await axios.get('/api/candidate/vote/count');
      setVoteCounts(response.data);
    } catch (error) {
      console.error('Error fetching vote counts:', error);
    }
  };

  const fetchCandidateApplications = async () => {
    try {
      const response = await axios.get('/api/candidate/applications');
      setCandidateApplications(response.data);
    } catch (error) {
      console.error('Error fetching candidate applications:', error);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this application?`)) {
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/candidate/applications/${applicationId}`, { action });
      alert(`Application ${action}ed successfully!`);
      fetchCandidateApplications();
      fetchCandidates(); // Refresh candidates list if approved
    } catch (error) {
      alert(`Failed to ${action} application.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Admin logout initiated...');
    logout();
    
    // Wait for logout to complete before navigation
    setTimeout(() => {
      console.log('🏁 Navigating to login page...');
      router.push('/');
    }, 200);
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/candidate', {
        ...newCandidate,
        age: parseInt(newCandidate.age)
      });
      alert('Candidate added!');
      setNewCandidate({ name: '', party: '', age: '' });
      fetchCandidates();
    } catch (error: unknown) {
      alert((error as any).response?.data?.message || 'Failed to add candidate.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCandidate = async (candidateId: string) => {
    setLoading(true);
    const updatedData = editingCandidate[candidateId];

    try {
      await axios.put(`/api/candidate/${candidateId}`, {
        ...updatedData,
        age: parseInt(updatedData.age)
      });
      alert('Candidate updated!');
      setEditingCandidate(prev => {
        const newState = { ...prev };
        delete newState[candidateId];
        return newState;
      });
      fetchCandidates();
    } catch (error) {
      alert('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/candidate/${candidateId}`);
      alert('Candidate deleted!');
      fetchCandidates();
      fetchVoteCounts(); // Refresh vote counts after deletion
    } catch (error) {
      alert('Delete failed.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (candidate: Candidate) => {
    setEditingCandidate(prev => ({
      ...prev,
      [candidate._id]: {
        name: candidate.name || '',
        party: candidate.party || '',
        age: (candidate.age || 0).toString()
      }
    }));
  };

  const cancelEditing = (candidateId: string) => {
    setEditingCandidate(prev => {
      const newState = { ...prev };
      delete newState[candidateId];
      return newState;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    // Show loading while redirecting to prevent flash
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, Admin</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add New Candidate */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Candidate</h2>
          <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Candidate Name"
              value={newCandidate.name}
              onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Party Name"
              value={newCandidate.party}
              onChange={(e) => setNewCandidate(prev => ({ ...prev, party: e.target.value }))}
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Candidate Age"
              value={newCandidate.age}
              onChange={(e) => setNewCandidate(prev => ({ ...prev, age: e.target.value }))}
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Candidate'}
            </button>
          </form>
        </div>

        {/* All Candidates */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">All Candidates</h2>
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {editingCandidate[candidate._id] ? (
                  // Editing mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="New Name"
                        value={editingCandidate[candidate._id].name}
                        onChange={(e) => setEditingCandidate(prev => ({
                          ...prev,
                          [candidate._id]: { ...prev[candidate._id], name: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="New Party"
                        value={editingCandidate[candidate._id].party}
                        onChange={(e) => setEditingCandidate(prev => ({
                          ...prev,
                          [candidate._id]: { ...prev[candidate._id], party: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="New Age"
                        value={editingCandidate[candidate._id].age}
                        onChange={(e) => setEditingCandidate(prev => ({
                          ...prev,
                          [candidate._id]: { ...prev[candidate._id], age: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateCandidate(candidate._id)}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => cancelEditing(candidate._id)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">{candidate.name}</p>
                      <p className="text-gray-600">Party: {candidate.party}</p>
                      <p className="text-gray-600">Age: {candidate.age}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(candidate)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(candidate._id)}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Applications */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Candidate Applications</h2>
          <div className="space-y-4">
            {candidateApplications.map((application) => (
              <div key={application._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-lg text-gray-900">{application.name}</h3>
                    <p className="text-gray-600">Age: {application.age}</p>
                    <p className="text-gray-600">Aadhar: {application.aadharCardNumber}</p>
                    <p className="text-gray-600">Party: {application.candidateParty}</p>
                    <p className="text-gray-600">
                      Applied: {new Date(application.candidateAppliedAt).toLocaleDateString()}
                    </p>
                    {application.candidateApprovedAt && (
                      <p className="text-gray-600">
                        Processed: {new Date(application.candidateApprovedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-700 mb-2"><strong>Manifesto:</strong></p>
                    <p className="text-gray-600 text-sm bg-white p-3 rounded-md border">
                      {application.candidateManifesto}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        application.candidateApplicationStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : application.candidateApplicationStatus === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {application.candidateApplicationStatus.charAt(0).toUpperCase() +
                         application.candidateApplicationStatus.slice(1)}
                      </span>
                      {application.candidateApplicationStatus === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApplicationAction(application._id, 'approve')}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application._id, 'reject')}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {candidateApplications.length === 0 && (
              <p className="text-gray-500 text-center">No candidate applications found.</p>
            )}
          </div>
        </div>

        {/* Vote Count */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Vote Count</h2>
          <div className="space-y-3">
            {voteCounts.map((count, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="font-medium">{count.party}</span>
                <span className="text-blue-600 font-bold">{count.voteCount} vote(s)</span>
              </div>
            ))}
            {voteCounts.length === 0 && (
              <p className="text-gray-500 text-center">No votes recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
