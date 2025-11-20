import React from "react";
import { NodeType } from "../../types";
import { motion } from "framer-motion";
import { Zap, ArrowRightLeft, Code, Settings, Clock } from "lucide-react";

const nodeTypes = [
  {
    type: NodeType.Trigger,
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    color: "border-yellow-400",
  },
  {
    type: NodeType.HttpRequest,
    icon: <ArrowRightLeft className="w-5 h-5 text-sky-400" />,
    color: "border-sky-400",
  },
  {
    type: NodeType.Function,
    icon: <Code className="w-5 h-5 text-emerald-400" />,
    color: "border-emerald-400",
  },
  {
    type: NodeType.Set,
    icon: <Settings className="w-5 h-5 text-purple-400" />,
    color: "border-purple-400",
  },
  {
    type: NodeType.Delay,
    icon: <Clock className="w-5 h-5 text-orange-400" />,
    color: "border-orange-400",
  },
];

const Sidebar: React.FC = () => {
  const type_of_step = "type_of_step";
  const all_type_of_step = JSON.parse(sessionStorage.getItem(type_of_step));

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-60 bg-gray-900/50 p-4 border-r border-white/10 flex flex-col gap-4 z-20">
      <h2 className="text-lg font-bold text-white">Nodes</h2>
      <div className="flex flex-col gap-3">
        {all_type_of_step?.map((data: any) => (
          <motion.div
            key={data.id}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-emerald-400 bg-gray-800/50 cursor-grab active:cursor-grabbing`}
            draggable
            // FIX: Framer Motion's `onDragStart` type conflicts with the native `draggable`
            // attribute's event. Casting the event to `any` resolves the TypeScript error.
            onDragStart={(e: any) => handleDragStart(e, data.app)}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(58, 76, 104, 1)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <img
              src={data.image_url}
              alt={data.action}
              className="
            w-12 h-12              sm:w-5 sm:h-5 
            md:w-7 md:h-7       lg:w-10 lg:h-10
            object-contain 
            rounded-lg
          "
            />
            <div className="flex flex-col leading-tight">
              <span className=" text-gray-300 text-lg font-semibold sm:text-sm md:text-base font-medium">
                {data.app}
              </span>

              <span className="text-white text-sm sm:text-base md:text-lg font-semibold">
                {data.action}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
