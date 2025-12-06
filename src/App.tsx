import React, { useState } from 'react';
import { ConnectionForm } from './components/ConnectionForm';
import { ObjectExplorer } from './components/ObjectExplorer';
import { QueryWorkspace } from './components/QueryWorkspace';
import { Database, LogOut } from 'lucide-react';

function App() {
  const [connectionString, setConnectionString] = useState<string | null>(null);
  const [initialQuery, setInitialQuery] = useState('');

  const handleDisconnect = () => {
    setConnectionString(null);
    setInitialQuery('');
  };

  const handleSelectTable = (schema: string, table: string) => {
    setInitialQuery(`SELECT * FROM "${schema}"."${table}" LIMIT 1000;`);
  };

  if (!connectionString) {
    return <ConnectionForm onConnect={setConnectionString} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <ObjectExplorer 
        connectionString={connectionString} 
        onSelectTable={handleSelectTable} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-10 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="truncate max-w-md" title={connectionString}>
              Connected to PostgreSQL
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </header>

        {/* Workspace */}
        <div className="flex-1 min-h-0">
          <QueryWorkspace 
            key={initialQuery} // Reset state when selecting new table
            connectionString={connectionString} 
            initialQuery={initialQuery} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
