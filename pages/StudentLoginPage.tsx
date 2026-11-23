import * as React from 'react';
import { useEffect, useState } from 'react';
import { Page, StudentPortalUser } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';




























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































interface StudentLoginPageProps {
  student: StudentPortalUser | null;
  onLoginSuccess: (student: StudentPortalUser) => void;
  onUpdateProfile: (student: StudentPortalUser) => void;
  onLogout: () => void;
  setPage: (page: Page) => void;
}

const DEMO_STUDENTS: StudentPortalUser[] = [
  {
    id: 1,
    fullName: 'Amina Banda',
    studentId: 'S1234567',
    email: 'amina.banda@sjbu.edu',
    password: 'Password123',
    faculty: 'Faculty of Business and Management',
    year: 'Year 3',
  },
  {
    id: 2,
    fullName: 'Joseph Mphande',
    studentId: 'S2345678',
    email: 'joseph.mphande@sjbu.edu',
    password: 'Password123',
    faculty: 'Faculty of Education',
    year: 'Year 2',
  },
  {
    id: 3,
    fullName: 'Grace Chirwa',
    studentId: 'S3456789',
    email: 'grace.chirwa@sjbu.edu',
    password: 'Password123',
    faculty: 'Faculty of Computer Science',
    year: 'Year 4',
  },
];

const matchStudent = (identifier: string, password: string): StudentPortalUser | undefined => {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const normalizedPassword = password.trim();

  return DEMO_STUDENTS.find((student) => {
    const matchesIdentifier =
      student.studentId.toLowerCase() === normalizedIdentifier ||
      student.email.toLowerCase() === normalizedIdentifier;

    return matchesIdentifier && student.password === normalizedPassword;
  });
};

const StudentLoginPage: React.FC<StudentLoginPageProps> = ({
  student,
  onLoginSuccess,
  onUpdateProfile,
  onLogout,
  setPage,
}) => {
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<StudentPortalUser | null>(student);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setProfile(student);
  }, [student]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const matchedStudent = matchStudent(studentIdentifier, password);

      if (!matchedStudent) {
        setError('Invalid student portal details. Use a demo account below or try the voucher flow.');
        return;
      }

      onLoginSuccess(matchedStudent);
    } finally {
      setIsSubmitting(false);
      setPassword('');
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!profile) {
      return;
    }

    const sanitizedProfile: StudentPortalUser = {
      ...profile,
      fullName: profile.fullName.trim() || 'Student',
      email: profile.email.trim() || profile.studentId + '@sjbu.edu',
      password: profile.password.trim() || 'Password123',
      faculty: profile.faculty.trim() || 'Faculty of General Studies',
      year: profile.year.trim() || 'Year 1',
    };

    onUpdateProfile(sanitizedProfile);
    setProfile(sanitizedProfile);
    setNotice('Your portal account details were updated successfully.');
  };

  if (student && profile) {
    return (
      <div className="min-h-[60vh] py-10 px-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dmi-blue-700">Student Portal</p>
            <h2 className="mt-2 text-3xl font-bold text-dmi-blue-900">Welcome back, {profile.fullName}</h2>
          </div>

          <Card className="p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-dmi-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dmi-blue-700">Student ID</p>
                <p className="text-2xl font-bold text-dmi-blue-900">{profile.studentId}</p>
                <p className="text-sm text-gray-600">{profile.faculty}</p>
                <p className="text-sm text-gray-600">{profile.year}</p>
              </div>

              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">Portal email</p>
                <p className="text-lg font-semibold text-gray-900">{profile.email}</p>
                <p className="text-sm text-gray-600">Demo account status: Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8">
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-dmi-blue-900">Basic account management</h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-green-700">
                  Demo mode
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-gray-700">
                  Full name
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-base text-gray-900 focus:border-dmi-blue-500 focus:outline-none focus:ring-2 focus:ring-dmi-blue-200"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700">
                  Student ID
                  <input
                    type="text"
                    value={profile.studentId}
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-3 text-base text-gray-600"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700">
                  Portal email
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-base text-gray-900 focus:border-dmi-blue-500 focus:outline-none focus:ring-2 focus:ring-dmi-blue-200"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700">
                  Faculty / programme
                  <input
                    type="text"
                    value={profile.faculty}
                    onChange={(e) => setProfile({ ...profile, faculty: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-base text-gray-900 focus:border-dmi-blue-500 focus:outline-none focus:ring-2 focus:ring-dmi-blue-200"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700 md:col-span-2">
                  Password
                  <input
                    type="password"
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-base text-gray-900 focus:border-dmi-blue-500 focus:outline-none focus:ring-2 focus:ring-dmi-blue-200"
                  />
                </label>
              </div>

              {notice && <p className="text-sm text-green-700">{notice}</p>}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="sm:flex-1">Save changes</Button>
                <Button type="button" variant="secondary" onClick={() => setPage(Page.Voting)} className="sm:flex-1">
                  Continue to vote
                </Button>
                <Button type="button" variant="danger" onClick={onLogout} className="sm:flex-none">
                  Logout
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dmi-blue-700">Student access</p>
          <h2 className="mt-2 text-3xl font-bold text-dmi-blue-900">Sign in to vote</h2>
          <p className="mt-3 text-sm text-gray-600">Use your student portal details to continue with the demo election flow.</p>
        </div>

        <Card className="overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-5 p-6 md:p-8">
            <div>
              <label htmlFor="studentId" className="mb-2 block text-sm font-medium text-gray-700">
                Student ID or portal email
              </label>
              <input
                id="studentId"
                type="text"
                value={studentIdentifier}
                onChange={(e) => setStudentIdentifier(e.target.value)}
                placeholder="e.g. S1234567 or amina.banda@sjbu.edu"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-base text-gray-900 focus:border-dmi-blue-500 focus:outline-none focus:ring-2 focus:ring-dmi-blue-200"
                required
              />
            </div>

            <div>
              <label htmlFor="studentPassword" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="studentPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your portal password"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-base text-gray-900 focus:border-dmi-blue-500 focus:outline-none focus:ring-2 focus:ring-dmi-blue-200"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="rounded-xl border border-dmi-blue-100 bg-blue-50 p-3 text-sm text-dmi-blue-800">
              <p className="font-semibold">Demo credentials</p>
              <p className="mt-1">S1234567 / Password123</p>
              <p>or amina.banda@sjbu.edu / Password123</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" className="sm:flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setPage(Page.Authentication)} className="sm:flex-1">
                Use voucher code
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StudentLoginPage;
