import React, { useState, useEffect } from 'react';
import { Search, Eye, AlertTriangle, Clock, Award, Filter } from 'lucide-react';

const ResultsManagement = () => {
  const [results, setResults] = useState([]); // Load results from your API here
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);
  const [violationsData, setViolationsData] = useState({}); // { [resultId]: [violations] }
  const [loadingViolations, setLoadingViolations] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch results from API on mount (example)
  useEffect(() => {
    async function fetchResults() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/results', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    // If using cookies: credentials: 'include',
                  });
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        console.error('Failed to fetch results', err);
      }
    }
    fetchResults();
  }, []);

  // Filter results based on search and status filter
  const filteredResults = results.filter(result => {
    const user = result.userId;
    const exam = result.examId;

    const matchesSearch =
      user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  // Fetch violation details by IDs
  const fetchViolationsByIds = async (violationIds) => {
    if (!violationIds || violationIds.length === 0) return [];

    try {
      setLoadingViolations(true);
      const idsParam = violationIds.join(',');
      const token= localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/violations?ids=${idsParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setLoadingViolations(false);
      return data.violations || [];
    } catch (error) {
      setLoadingViolations(false);
      console.error('Failed to fetch violations', error);
      return [];
    }
  };

  // Colors for status and score
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score, totalScore) => {
    const percentage = (score / totalScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getViolationSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Results & Reports</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, email, or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentResults.map(result => {
                const user = result.userId;
                const exam = result.examId;
                const durationMs = new Date(result.endTime).getTime() - new Date(result.startTime).getTime();
                const durationMinutes = Math.floor(durationMs / (1000 * 60));

                return (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user?.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.photo}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                          <div className="text-sm text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{exam?.title}</div>
                      <div className="text-sm text-gray-500">{exam?.duration} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getScoreColor(result.score, result.totalScore)}`}>
                        {result.score}/{result.totalScore}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round((result.score / result.totalScore) * 100)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {durationMinutes} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {result.violations.length > 0 ? (
                          <div className="flex items-center">
                            <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-sm text-red-600 font-medium">{result.violations.length} violations</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Award className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Clean</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedResult(result)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredResults.length)} of {filteredResults.length} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded-lg ${
                currentPage === page
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Result Details Modal */}
      {/* {selectedResult && (
        <ResultDetailsModal
          result={selectedResult}
          user={selectedResult.userId}
          exam={selectedResult.examId}
          violations={violationsData[selectedResult._id] || []}
          loadingViolations={loadingViolations}
          fetchViolations={() =>
            fetchViolationsByIds(selectedResult.violations).then(data => {
              setViolationsData(prev => ({ ...prev, [selectedResult._id]: data }));
            })
          }
          onClose={() => setSelectedResult(null)}
          getViolationSeverityColor={getViolationSeverityColor}
        />
      )} */}
      {selectedResult && (
  <ResultDetailsModal
    result={selectedResult}
    user={selectedResult.userId}
    exam={selectedResult.examId}
    violations={violationsData[selectedResult._id] || []}
    loadingViolations={loadingViolations}
    fetchViolations={() =>
      fetchViolationsByIds(selectedResult.violations).then(data => {
        setViolationsData(prev => ({ ...prev, [selectedResult._id]: data }));
      })
    }
    onClose={() => setSelectedResult(null)}
    getViolationSeverityColor={getViolationSeverityColor}
    selectedImageUrl={selectedImageUrl}
    setSelectedImageUrl={setSelectedImageUrl}
  />
)}

    </div>
  );
};

const ResultDetailsModal = ({
  result,
  user,
  exam,
  violations,
  loadingViolations,
  fetchViolations,
  onClose,
  getViolationSeverityColor,
  selectedImageUrl,
  setSelectedImageUrl,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch violations on tab switch to Violations tab if not already fetched
  useEffect(() => {
    if (activeTab === 'violations' && violations.length === 0) {
      fetchViolations();
    }
  }, [activeTab]);

  const getViolationIcon = (type) => {
    switch (type) {
      case 'tab-switch':
        return '🔄';
      case 'window-focus':
        return '👁️';
      case 'face-not-detected':
        return '😶';
      case 'multiple-faces':
        return '👥';
      case 'phone-detected':
        return '📱';
      default:
        return '⚠️';
    }
  };

  const duration = new Date(result.endTime).getTime() - new Date(result.startTime).getTime();
  const durationMinutes = Math.floor(duration / (1000 * 60));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Exam Result Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 ${
              activeTab === 'overview'
                ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`pb-2 px-1 ${
              activeTab === 'violations'
                ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Violations ({result.violations.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Student & Exam Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Student Information</h4>
                <div className="flex items-center space-x-4">
                  {user?.photo ? (
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={user.photo}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-700">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-600">{user?.department}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Exam Information</h4>
                <div>
                  <p className="font-medium">{exam?.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{exam?.description}</p>
                  <p className="text-sm text-gray-600 mt-1">Duration: {exam?.duration} minutes</p>
                </div>
              </div>
            </div>

            {/* Score & Performance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round((result.score / result.totalScore) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {result.score}/{result.totalScore}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {durationMinutes}
                  </div>
                  <div className="text-sm text-gray-600">Duration (minutes)</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {result.violations.length}
                  </div>
                  <div className="text-sm text-gray-600">Violations</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full ${result.status === 'completed' ? 'bg-green-100 text-green-800' : result.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {result.status}
                  </span>
                  <div className="text-sm text-gray-600 mt-1">Status</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'violations' && (
          <div>
            {loadingViolations ? (
              <p>Loading violations...</p>
            ) : violations.length === 0 ? (
              <p>No violations detected.</p>
            ) : (
              <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
                {violations.map((v) => (
                  <li key={v._id} className="border border-gray-200 rounded-lg p-4 flex items-center space-x-4">
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getViolationSeverityColor(v.severity)}`}
                      title={v.type}
                    >
                      <span className="text-lg">{getViolationIcon(v.type)}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{v.type.replace(/-/g, ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-600">{v.description}</p>
                      <p className="text-xs text-gray-400">Severity: {v.severity}</p>
                      <p className="text-xs text-gray-400">Timestamp: {new Date(v.timestamp).toLocaleString()}</p>
                        {v.evidenceUrl && (
                          <div className="mt-2">
                            <button
                              onClick={() => setSelectedImageUrl(v.evidenceUrl)}
                              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              View Evidence
                            </button>
                          </div>
                        )}


                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
            {/* 🔍 Evidence Image Modal */}
      {selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
          onClick={() => setSelectedImageUrl(null)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImageUrl}
              alt="Full Violation Evidence"
              className="max-w-full max-h-[80vh] rounded-lg shadow-lg"
            />
            <button
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-60 px-3 py-1 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default ResultsManagement;
