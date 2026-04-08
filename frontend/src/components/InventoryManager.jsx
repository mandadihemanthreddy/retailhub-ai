import React, { useState, useEffect } from 'react';
import { Package, Upload, Plus, Trash2, Edit, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';

const InventoryManager = ({ session }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csvText, setCsvText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchProducts();
  }, [session]);

  // Dynamically calculate table columns based on all existing JSONB keys across all products
  const dynamicColumns = React.useMemo(() => {
    const keys = new Set(['name', 'price', 'stock']); // Force core columns first
    products.forEach(p => {
      if (p.metadata) {
        Object.keys(p.metadata).forEach(k => {
          if (k !== 'note' && k !== 'category_core') keys.add(k);
        });
      }
    });
    return Array.from(keys);
  }, [products]);

  const handleCsvUpload = async (textToUpload = csvText) => {
    if (!textToUpload) return alert("Please paste CSV data or drop a file first");
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ csvText: textToUpload })
      });
      if (res.ok) {
        alert("AI Processing complete! Database mapped successfully.");
        setCsvText('');
        fetchProducts();
      } else {
        alert("AI Parsing failed. Ensure data is comma separated.");
      }
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        setCsvText(text); // show preview
        handleCsvUpload(text); // trigger injection
      };
      reader.readAsText(file);
    }
  };

  const deleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const purgeInventory = async () => {
    if (window.confirm("Are you sure you want to MASS DELETE all stock?")) {
        await supabase.from("products").delete().not("id", "is", null);
        fetchProducts();
    }
  };

  if (loading) return <div style={{padding: '40px', color: '#94a3b8'}}>Loading stock database...</div>;

  return (
    <div className="dashboard-container" style={{maxWidth: '1200px', margin: '0 auto', flex: 1, overflowY: 'auto', padding: '24px', height: '100%'}}>
      <div className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h2 style={{fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Package color="#3b82f6" /> Inventory Management
        </h2>
        <div style={{display: 'flex', gap: '12px'}}>
          <button onClick={purgeInventory} style={{background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(248, 113, 113, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600}}>
            <Trash2 size={18} /> Purge All
          </button>
          <button style={{background: '#3b82f6', color: 'white', padding: '10px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600}}>
            <Plus size={18} /> Add Single Product
          </button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px'}}>
        {/* CSV Upload Pane */}
        <div style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px'}}>
          <h3 style={{marginBottom: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Upload size={18} /> AI Data Ingestion
          </h3>
          <p style={{fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px'}}>Drop any CSV format. AI will map the schema.</p>
          
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            style={{ border: '2px dashed rgba(59,130,246,0.5)', borderRadius: '12px', padding: '32px 16px', textAlign: 'center', marginBottom: '16px', background: 'rgba(59,130,246,0.05)', cursor: 'pointer' }}
            onClick={() => document.getElementById('fileUpload').click()}
          >
            <Upload size={24} color="#3b82f6" style={{marginBottom: '8px'}} />
            <p style={{fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500}}>Drag & Drop CSV File</p>
            <p style={{fontSize: '0.75rem', color: '#94a3b8'}}>or click to browse native files</p>
            <input type="file" id="fileUpload" accept=".csv" style={{display: 'none'}} onChange={handleFileDrop} />
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0'}}>
            <hr style={{flex: 1, border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)'}} />
            <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>OR PASTE RAW</span>
            <hr style={{flex: 1, border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)'}} />
          </div>

          <textarea 
            style={{width: '100%', height: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', padding: '12px', marginBottom: '16px', resize: 'none'}}
            placeholder="Hardware, 45, 100, Home Depot&#10;..."
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />
          <button 
            onClick={() => handleCsvUpload(csvText)} 
            style={{width: '100%', background: 'var(--user-msg-bg)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500}}
          >
            Process Raw Text Input
          </button>
        </div>

        {/* Database List Pane */}
        <div style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column'}}>
          {/* Table Header w/ Search Toolbar */}
          <div style={{padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3 style={{fontSize: '1rem', color: '#f8fafc', margin: 0}}>SKU Catalog</h3>
            <div style={{position: 'relative'}}>
              <Search size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}} />
              <input 
                type="text" 
                placeholder="Search Database..." 
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', outline: 'none', width: '250px'}}
              />
            </div>
          </div>
          <div style={{overflowY: 'auto', maxHeight: 'calc(100vh - 180px)'}}>
            <table className="insights-table" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap'}}>
              <thead style={{background: 'rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 1}}>
                <tr>
                  {dynamicColumns.map(col => (
                    <th key={col} style={{padding: '16px', textTransform: 'capitalize', color: '#94a3b8', fontWeight: 600}}>
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                  <th style={{padding: '16px', textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...products]
                  .filter(p => !searchFilter || 
                    dynamicColumns.some(col => {
                       const val = (p[col] !== undefined) ? p[col] : (p.metadata?.[col] || '');
                       return String(val).toLowerCase().includes(searchFilter.toLowerCase());
                    })
                  )
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(p => (
                  <tr key={p.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                    {dynamicColumns.map(col => {
                      const isCore = ['name', 'price', 'stock'].includes(col);
                      let val = isCore ? p[col] : p.metadata?.[col];
                      
                      if (val === undefined || val === null) val = '-';
                      if (col === 'price' && !isNaN(val)) val = `$${parseFloat(val).toFixed(2)}`;
                      if (col === 'stock' && !isNaN(val)) {
                         return (
                           <td key={col} style={{padding: '16px'}}>
                             <span style={{background: val < 10 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: val < 10 ? '#f87171' : '#4ade80', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem'}}>
                               {val}
                             </span>
                           </td>
                         )
                      }
                      
                      return <td key={col} style={{padding: '16px', color: isCore ? '#f8fafc' : '#cbd5e1'}}>{String(val)}</td>;
                    })}
                    <td style={{padding: '16px', textAlign: 'right'}}>
                      <button style={{background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginRight: '12px'}}><Edit size={16} /></button>
                      <button onClick={() => deleteProduct(p.id)} style={{background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer'}}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={dynamicColumns.length + 1} style={{padding: '24px', textAlign: 'center', color: '#94a3b8'}}>No stock data available. Bulk import using the CSV tool.</td></tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  </div>
  );
};

export default InventoryManager;
