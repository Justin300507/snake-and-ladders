import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Mail, Edit, Save, XCircle } from 'lucide-react';
import API from '../api';
import Header from '../components/Header';

const parseError = (err) => {
  if (!err.response) return null;
  const detail = err.response?.data?.detail;
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ');
  return 'Something went wrong. Please try again.';
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    display_name: '',
    email: ''
  });
  const [updateError, setUpdateError] = React.useState(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
      setFormData({
        display_name: res.data.display_name || '',
        email: res.data.email || ''
      });
    } catch (err) {
      setError(parseError(err));
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const res = await API.put('/users/me', formData);
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      setUpdateError(parseError(err));
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Header>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="ml-3 text-slate-700 dark:text-slate-300">Loading profile...</p>
        </div>
      </Header>
    );
  }

  if (error) {
    return (
      <Header>
        <div className="flex flex-col items-center justify-center h-64 text-red-600 dark:text-red-400">
          <XCircle className="w-10 h-10 mb-3" />
          <p className="text-lg font-medium">Error loading profile:</p>
          <p className="text-sm mt-1 text-center">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retry
          </button>
        </div>
      </Header>
    );
  }

  if (!user) {
    return (
      <Header>
        <div className="flex flex-col items-center justify-center h-64 text-slate-700 dark:text-slate-300">
          <User className="w-10 h-10 mb-3" />
          <p className="text-lg font-medium">No profile data available.</p>
        </div>
      </Header>
    );
  }

  return (
    <Header>
      <div className="animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account information.</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Personal Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Details about your account.</p>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700">
            <dl>
              <div className="bg-slate-50 dark:bg-slate-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Display Name</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="display_name"
                      value={formData.display_name}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  ) : (
                    user.display_name
                  )}
                </dd>
              </div>
              <div className="bg-white dark:bg-slate-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Email address</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  ) : (
                    user.email
                  )}
                </dd>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">User ID</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">{user.id}</dd>
              </div>
            </dl>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end space-x-3">
            {updateError && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center mr-2">
                <XCircle className="w-4 h-4 mr-1" /> {updateError}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  display_name: user.display_name || '',
                  email: user.email || ''
                });
                setUpdateError(null);
              }}
              className="inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              ) : (
                <Save className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>
    </Header>
  );
};

export default ProfilePage;
