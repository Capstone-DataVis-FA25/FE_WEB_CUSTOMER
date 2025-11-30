import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Plus, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PivotZoneProps {
  label: string;
  icon: string;
  desc: string;
  zoneId: 'pivot-rows' | 'pivot-columns' | 'pivot-values';
}

const PivotZone: React.FC<PivotZoneProps> = ({ label, icon, desc, zoneId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${zoneId}-drop`,
    data: { zone: zoneId },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative rounded-xl border-2 border-dashed transition-all duration-300 flex-1 min-h-[200px] flex flex-col items-center justify-center overflow-hidden',
        isOver
          ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/30 shadow-lg shadow-amber-500/20'
          : 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10'
      )}
    >
      {isOver ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2 justify-center text-sm">
            <Plus className="w-5 h-5" />
            Drop here
          </div>
        </motion.div>
      ) : (
        <div className="text-center text-amber-600 dark:text-amber-400">
          <div className="text-3xl mb-3">{icon}</div>
          <p className="text-sm font-medium mb-1">{label}</p>
          <p className="text-xs opacity-75">{desc}</p>
          <p className="text-xs opacity-50 mt-2">Drop column here</p>
        </div>
      )}
    </div>
  );
};

const PivotTab: React.FC = () => {
  const pivotZones: PivotZoneProps[] = [
    { label: 'Rows', icon: '↔️', desc: 'Row headers', zoneId: 'pivot-rows' },
    { label: 'Columns', icon: '↕️', desc: 'Column headers', zoneId: 'pivot-columns' },
    { label: 'Values', icon: '🔢', desc: 'Numbers only', zoneId: 'pivot-values' },
  ];

  return (
    <motion.div
      key="pivot"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full min-h-[500px]"
    >
      <div className="text-center mb-4">
        <Table2 className="w-12 h-12 text-amber-400 dark:text-amber-500 mx-auto mb-3 opacity-50" />
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pivot Table</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Coming soon! Drag columns to create pivot tables
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {pivotZones.map(zone => (
          <PivotZone key={zone.zoneId} {...zone} />
        ))}
      </div>
    </motion.div>
  );
};

export default PivotTab;
