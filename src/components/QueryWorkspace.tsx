import React, { useState } from 'react';
import { Play, Download, Trash2, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QueryWorkspaceProps {
  connectionString: string;
  initialQuery?: string;
}

export function QueryWorkspace({ connectionString, initialQuery = '' }: QueryWorkspaceProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setExecutionTime(null);

    const startTime = performance.now();

    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/pg-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`, // For RLS if needed, though proxy handles connection
        },
        body: JSON.stringify({ connectionString, query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle BigInt serialization
      const deserializedData = JSON.parse(
        JSON.stringify(data),
        (key, value) => (typeof value === 'string' && /^-?\d+n$/.test(value)) ? BigInt(value.slice(0, -1)) : value
      );

      setResults(deserializedData);
    } catch (err: any) {
      console.error('Query execution error:', err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  // ... existing code ...
  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="h-12 border-b border-gray-700 flex items-center px-4 gap-4 bg-gray-800">
        <button
          onClick={handleRun}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Run Query (Ctrl+Enter)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Run
        </button>

        <div className="h-6 w-px bg-gray-600 mx-2" />

        <button 
          onClick={() => setQuery('')}
          className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-700"
          title="Clear Editor"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Split Pane: Editor & Results */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Editor */}
        <div className="h-1/2 border-b border-gray-700 flex flex-col min-h-[100px]">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-[#1e1e1e] text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none"
            placeholder="-- Type your SQL query here..."
            spellCheck={false}
          />
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
          <div className="h-8 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Results</span>
            <div className="flex items-center gap-4">
              {executionTime !== null && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{executionTime}ms</span>
                </div>
              )}
              {results && (
                <span>{results.rowCount} rows</span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading && (
              <div className="flex items-center justify-center h-full text-gray-500 gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Executing query...</span>
              </div>
            )}

            {error && (
              <div className="p-4 text-red-400 font-mono text-sm whitespace-pre-wrap">
                <div className="flex items-center gap-2 mb-2 font-bold text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>Error Executing Query</span>
                </div>
                {error}
              </div>
            )}

            {!loading && !error && results && results.rows.length === 0 && (
              <div className="p-4 text-gray-500 italic">No results returned.</div>
            )}

            {!loading && !error && results && results.rows.length > 0 && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-800 sticky top-0">
                  <tr>
                    {results.columns.map((col: string, i: number) => (
                      <th key={`${col}-${i}`} className="p-2 text-xs font-semibold text-gray-300 border-b border-r border-gray-700 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono text-xs text-gray-300">
                  {results.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-800/50">
                      {results.columns.map((col: string, colIndex: number) => (
                        <td key={`${col}-${colIndex}`} className="p-2 border-b border-r border-gray-800 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                          {row[col] === null ? <span className="text-gray-600 italic">NULL</span> : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}