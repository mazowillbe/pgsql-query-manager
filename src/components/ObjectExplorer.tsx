import { useEffect, useState } from 'react';
import { Database, Table, ChevronRight, ChevronDown, RefreshCw, LayoutList } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ObjectExplorerProps {
  connectionString: string;
  onSelectTable: (schema: string, table: string) => void;
}

interface TableInfo {
  schema: string;
  name: string;
  type: string;
}

export function ObjectExplorer({ connectionString, onSelectTable }: ObjectExplorerProps) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set(['public']));
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = `
        SELECT table_schema as schema, table_name as name, table_type as type 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog') 
        ORDER BY table_schema, table_name;
      `;

      const { data, error: fnError } = await supabase.functions.invoke('pg-proxy', {
        body: { connectionString, query }
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setTables(data.rows.map((row: any) => ({
        schema: row.schema || row.table_schema, // handle both casing depending on driver
        name: row.name || row.table_name,
        type: row.type || row.table_type
      })));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [connectionString]);

  const toggleSchema = (schema: string) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(schema)) {
      newExpanded.delete(schema);
    } else {
      newExpanded.add(schema);
    }
    setExpandedSchemas(newExpanded);
  };

  // Group by schema
  const schemas = Array.from(new Set(tables.map(t => t.schema)));

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full text-sm">
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-200">
          <Database className="w-4 h-4" />
          <span>Explorer</span>
        </div>
        <button 
          onClick={fetchTables} 
          className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {error && (
          <div className="text-red-400 text-xs p-2 mb-2 bg-red-900/20 rounded">
            {error}
          </div>
        )}

        {schemas.map(schema => (
          <div key={schema} className="mb-1">
            <button
              onClick={() => toggleSchema(schema)}
              className="w-full flex items-center gap-1 p-1 hover:bg-gray-800 rounded text-gray-300 hover:text-white text-left group"
            >
              {expandedSchemas.has(schema) ? (
                <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-gray-300" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-gray-300" />
              )}
              <LayoutList className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate font-medium">{schema}</span>
            </button>

            {expandedSchemas.has(schema) && (
              <div className="ml-4 mt-0.5 border-l border-gray-700 pl-1">
                {tables
                  .filter(t => t.schema === schema)
                  .map(table => (
                    <button
                      key={`${schema}.${table.name}`}
                      onClick={() => onSelectTable(schema, table.name)}
                      className="w-full flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-blue-300 text-left text-xs"
                    >
                      <Table className="w-3 h-3" />
                      <span className="truncate">{table.name}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}