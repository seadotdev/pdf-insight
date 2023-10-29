import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";



import 'reactflow/dist/style.css';

import ReactFlow, {
  Controls,
  Background,
  addEdge,
  FitViewOptions,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Handle, Position
} from 'reactflow';

const initialNodes: Node[] = [
  { id: '1', data: { label: 'Finance Agent' }, position: { x: 200, y: 100 } },
  
  { id: '2', data: { label: 'Data Management' }, position: { x: 50, y: 400 } },
  { id: '3', data: { label: 'Customer Engagement' }, position: { x: 250, y: 400 } },
  { id: '4', data: { label: 'Document Management' }, position: { x: 450, y: 400 } },
  { id: '5', data: { label: 'Document Review' }, position: { x: 650, y: 400 } },
  { id: '6', data: { label: 'Internal Review' }, position: { x: 650, y: 600 } },
  { id: '9', data: { label: 'Client Review' }, position: { x: 850, y: 600 } },



  { id: '7', data: { label: 'Open Accounting' }, position: { x: 50, y: 600 } },
  { id: '8', data: { label: 'Open Banking' }, position: { x: 250, y: 600 } },

];
const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2', animated: true, label: 'Active'},
                              { id: 'e1-2', source: '1', target: '3', animated: false, label: 'Paused' },
                              { id: 'e1-2', source: '1', target: '4', animated: true, label: 'Active' },
                              { id: 'e1-2', source: '1', target: '5', animated: true, label: 'Active' },
                              { id: 'e1-2', source: '2', target: '7', animated: true, label: 'Active' },
                              { id: 'e1-2', source: '2', target: '8', animated: false, label: 'Paused' },
                              { id: 'e1-2', source: '2', target: '8', animated: false, label: 'Paused' },
                              { id: 'e1-2', source: '5', target: '6', animated: true, label: 'Active' },
                              { id: 'e1-2', source: '5', target: '9', animated: false, label: 'Paused' },
                              { id: 'e1-2', source: '2', target: '8', animated: false, label: 'Paused' }
                            ];



export default function Flow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const reactFlowStyle = {
    background: 'grey',
    width: '100%',
    height: 300,
  };
  

  return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 pb-4">
            <span className="font-extrabold">Deployed Agents</span>
            <div style={{ width: '65vw', height: '50vh' }}>
            <ReactFlow style={reactFlowStyle} 
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                />
                </div>

            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b bg-white font-medium dark:border-neutral-500 dark:bg-neutral-600">
                  <tr>
                    <th scope="col" className="px-6 py-4"></th>
                    <th scope="col" className="px-6 py-4">Agent Owner</th>
                    <th scope="col" className="px-6 py-4">Utilisation Rate</th>
                    <th scope="col" className="px-6 py-4">Errors</th>
                    <th scope="col" className="px-6 py-4">Config</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-400 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">1</td>
                    <td className="whitespace-nowrap px-6 py-4">Siya Kolisi</td>
                    <td className="whitespace-nowrap px-6 py-4">45%</td>
                    <td className="whitespace-nowrap px-6 py-4"></td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
                    </svg></td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-400 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">2</td>
                    <td className="whitespace-nowrap px-6 py-4">Handre Pollard</td>
                    <td className="whitespace-nowrap px-6 py-4">65%</td>
                    <td className="whitespace-nowrap px-6 py-4"></td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
                    </svg></td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-400 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">3</td>
                    <td className="whitespace-nowrap px-6 py-4">Cheslin Kolbe</td>
                    <td className="whitespace-nowrap px-6 py-4">67%</td>
                    <td className="whitespace-nowrap px-6 py-4"></td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
                    </svg></td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-400 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium"></td>
                    <td className="whitespace-nowrap px-6 py-4"></td>
                    <td className="whitespace-nowrap px-6 py-4"></td>
                    <td className="whitespace-nowrap px-6 py-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* <Image src="/integrations.png" width={1800} height={800} className="mx-2 rounded-lg" alt="analytics" /> */}
          </div>
        </div>);
};


//   );
// }

// TODO - figure out force feedback layout https://reactflow.dev/docs/guides/layouting/#d3-force
// TODO - figure out custom nodes 

