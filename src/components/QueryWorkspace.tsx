import React, { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react'; // Keep these for now, may be used later
// import { Play, Trash2, Clock, AlertCircle } from 'lucide-react';
// import { supabase } from '../lib/supabase'; // Removed unused import
// import { useEffect, useRef } from 'react';

// interface QueryWorkspaceProps {
//   connectionString: string;
//   initialQuery?: string;
// }

// export function QueryWorkspace({ connectionString, initialQuery = '' }: QueryWorkspaceProps) {
//   const [query, setQuery] = useState(initialQuery);
//   const [results, setResults] = useState<any | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [executionTime, setExecutionTime] = useState<number | null>(null);

//   const handleRun = async () => {
//     setLoading(true);
//     setError(null);
//     setResults(null);
//     setExecutionTime(null);

//     const startTime = performance.now();

//     try {
//       const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pg-proxy`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
//           'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, // For RLS if needed, though proxy handles connection
//         },
//         body: JSON.stringify({ connectionString, query }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       // Handle BigInt serialization
//       const deserializedData = JSON.parse(
//         JSON.stringify(data),
//         (key, value) => (typeof value === 'string' && /^-?\\d+n$/.test(value)) ? BigInt(value.slice(0, -1)) : value
//       );

//       setResults(deserializedData);
//     } catch (err: any) {
//       console.error('Query execution error:', err);
//       setError(err.message || 'An unknown error occurred.');
//     } finally {
//       const endTime = performance.now();
//       setExecutionTime(Math.round(endTime - startTime));
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
//       e.preventDefault();
//       handleRun();
//     }
//   };

//   // ... existing code ...
//   return (
//     <div className="flex flex-col h-full bg-gray-900">
//       {/* Toolbar */}
//       <div className="h-12 border-b border-gray-700 flex items-center px-4 gap-4 bg-gray-800">
//         <button
//           onClick={handleRun}
//           disabled={loading || !query.trim()}
//           className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           title="Run Query (Ctrl+Enter)"
//         >
//           <Play className="w-3.5 h-3.5 fill-current" />
//           Run
//         </button>

//         <div className="h-6 w-px bg-gray-600 mx-2" />

//         <button 
//           onClick={() => setQuery('')}
//           className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-700"
//           title="Clear Editor"
//         >
//           <Trash2 className="w-4 h-4" />
//         </button>
//       </div>

//       {/* Split Pane: Editor & Results */}
//       <div className="flex-1 flex flex-col min-h-0">
//         {/* Editor */}
//         <div className="h-1/2 border-b border-gray-700 flex flex-col min-h-[100px]">
//           <textarea
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={handleKeyDown}
//             className="flex-1 bg-[#1e1e1e] text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none"
//             placeholder="-- Type your SQL query here..."
//             spellCheck={false}
//           />
//         </div>

//         {/* Results */}
//         <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
//           <div className="h-8 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between text-xs text-gray-400">
//             <span className="font-semibold text-gray-300">Results</span>
//             <div className="flex items-center gap-4">
//               {executionTime !== null && (
//                 <div className="flex items-center gap-1.5">
//                   <Clock className="w-3 h-3" />
//                   <span>{executionTime}ms</span>
//                 </div>
//               )}
//               {results && (
//                 <span>{results.rowCount} rows</span>
//               )}
//             </div>
//           </div>

//           <div className="flex-1 overflow-auto">
//             {loading && (
//               <div className="flex items-center justify-center h-full text-gray-500 gap-2">
//                 <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                 <span>Executing query...</span>
//               </div>
//             )}

//             {error && (
//               <div className="p-4 text-red-400 font-mono text-sm whitespace-pre-wrap">
//                 <div className="flex items-center gap-2 mb-2 font-bold text-red-300">
//                   <AlertCircle className="w-4 h-4" />
//                   <span>Error Executing Query</span>
//                 </div>
//                 {error}
//               </div>
//             )}

//             {!loading && !error && results && results.rows.length === 0 && (
//               <div className="p-4 text-gray-500 italic">No results returned.</div>
//             )}

//             {!loading && !error && results && results.rows.length > 0 && (
//               <table className="w-full text-left border-collapse">
//                 <thead className="bg-gray-800 sticky top-0">
//                   <tr>
//                     {results.columns.map((col: string, i: number) => (
//                       <th key={`${col}-${i}`} className="p-2 text-xs font-semibold text-gray-300 border-b border-r border-gray-700 whitespace-nowrap">
//                         {col}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="font-mono text-xs text-gray-300">
//                   {results.rows.map((row: any, rowIndex: any) => (
//                     <tr key={rowIndex} className="hover:bg-gray-800/50">
//                       {results.columns.map((col: string, colIndex: number) => (
//                         <td key={`${col}-${colIndex}`} className="p-2 border-b border-r border-gray-800 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
//                           {row[col] === null ? <span className="text-gray-600 italic">NULL</span> : String(row[col])}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

const QueryWorkspace = () => {
  const [query, setQuery] = useState('SELECT now()');
  const [results, setResults] = useState<{ columns: string[]; rows: any[]; time: number | null; count: number | null; } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Removed executionTime state as it's not used
  const [showTableList, setShowTableList] = useState(true);
  const queryRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (queryRef.current) {
      queryRef.current.focus();
    }
  }, []);

  const handleRun = async () => {
    if (!query.trim()) {
      setError('Query cannot be empty.');
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    //setExecutionTime(null);  // Execution time is obtained directly from the result now

    try {
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + 'functions/v1/pg-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pg-connection-string': localStorage.getItem('pgConnectionString') || '',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ query }),
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text);
      }

      const data = JSON.parse(text, (
        _key, // Ensure this is _key to avoid TS6133
        value) => (typeof value === 'string' && /^-?\\d+n$/.test(value)) ? BigInt(value.slice(0, -1)) : value
      );
      setResults(data);
      //Execution Time is set from the 'data' object that's returned.
      //setExecutionTime(data.time);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="flex h-full bg-stone-900 text-stone-100">
      <div className={`transition-all duration-300 ${showTableList ? 'w-64' : 'w-12'} flex-shrink-0 border-r border-stone-700 bg-stone-800`}>
        <div
          className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-stone-300"
          onClick={() => setShowTableList(!showTableList)}
        >
          {showTableList ? 'OBJECT EXPLORER' : <ChevronDown className="h-4 w-4 rotate-90" />}
          {showTableList && <ChevronDown className="h-4 w-4 -rotate-90" />}
        </div>
        {showTableList && (
          <div className="p-4 text-sm">
            <p>Tables (soon)</p>
          </div>
        )}
      </div>
      <div className="flex flex-grow flex-col">
        <div className="flex-shrink-0 border-b border-stone-700 p-4">
          <textarea
            ref={queryRef}
            className="w-full resize-none rounded bg-stone-700 p-2 font-mono text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows={6}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your SQL query here..."
          />
          <button
            className="mt-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            onClick={handleRun}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run'}
          </button>
        </div>
        <div className="flex-grow overflow-auto p-4">
          {error && (
            <div className="mb-4 rounded bg-red-800 p-3 text-red-100">
              <p className="font-bold">Error:</p>
              <pre className="whitespace-pre-wrap text-sm">{error}</pre>
            </div>
          )}
          {results && (
            <div>
              <div className="mb-2 text-xs text-stone-400">
                {results.count !== null && <span className="mr-4">Rows: {results.count}</span>}
                {results.time !== null && <span>Time: {results.time.toFixed(2)} ms</span>}
              </div>
              {results.rows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse text-sm">
                    <thead>
                      <tr>
                        {results.columns.map((column, index) => (
                          <th key={`header-${column}-${index}`} className="border border-stone-700 bg-stone-700 p-2 text-left font-semibold text-stone-200">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.rows.map((row, rowIndex) => (
                        <tr key={`row-${rowIndex}`} className="hover:bg-stone-700">
                          {results.columns.map((column, colIndex) => (
                            <td key={`cell-${rowIndex}-${column}-${colIndex}`} className="border border-stone-700 p-2 text-stone-300">
                              {row[column] !== null && row[column] !== undefined ? row[column].toString() : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-stone-400">No results to display.</p>
              )}
            </div>
          )}
          {!loading && !error && !results && <p className="text-stone-400">Run a query to see results.</p>}
        </div>
      </div>
    </div>
  );
};

export default QueryWorkspace;