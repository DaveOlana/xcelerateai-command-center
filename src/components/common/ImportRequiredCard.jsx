import React from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

export default function ImportRequiredCard({ pageName }) {
  return (
    <div className="card border-dashed border-accent-cyan/20 bg-accent-cyan/5 p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 animate-scale-in">
      <div className="w-14 h-14 rounded-full bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center mx-auto shadow-cyan-glow-sm">
        <Database className="w-6 h-6 text-accent-cyan" />
      </div>
      <h2 className="text-lg font-bold text-white">Roadmap Data Missing</h2>
      <p className="text-xs text-slate-400 leading-relaxed">
        The {pageName || 'requested section'} needs an active course. Open Advanced Settings to recover or import a curriculum.
      </p>
      <div className="pt-2">
        <Link
          to="/import"
          className="btn-primary py-2.5 px-6 text-xs font-bold shadow-primary-glow inline-flex items-center gap-2"
        >
           Load Custom JSON
        </Link>
      </div>
    </div>
  );
}
