import React, { useEffect, useState } from 'react';
import { useEthereum } from '../contexts/EthereumContext';
import Card   from '../components/ui/Card';
import Button from '../components/ui/Button';

interface Uni{addr:string;name:string;}

const UniversityListPage:React.FC=()=>{
  const { contract,isAdmin } = useEthereum();
  const [unis,setUnis]=useState<Uni[]>([]);
  const [loading,setLoad]=useState(false);

  const [addr,setAddr]=useState(''); const [name,setName]=useState('');
  const [adding,setAdding]=useState(false);

  const load=async()=>{
    if(!contract) return;
    setLoad(true);
    try{
      const cnt=(await contract.getUniversityCount()).toNumber();
      const out:Uni[]=[];
      for(let i=0;i<cnt;i++){
        const [ua,un]=await contract.getUniversityAtIndex(i);
        out.push({addr:ua,name:un});
      }
      setUnis(out);
    }finally{ setLoad(false);}
  };
  useEffect(()=>{load();},[contract]);

  const addUni=async()=>{
    if(!contract||!addr||!name) return;
    setAdding(true);
    try{
      const tx=await contract.addUniversity(addr,name);
      await tx.wait(); setAddr('');setName(''); load();
    }finally{ setAdding(false);}
  };

  const input="w-full border rounded px-3 py-2";

  return(
    <div className="space-y-10 fade-in">
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Registered Universities</h2>
        {loading? <p>Loading…</p> :
         unis.length===0? <p>No universities yet.</p> :
         <ul className="space-y-2">
           {unis.map(u=>(
             <li key={u.addr} className="border rounded px-3 py-2">
               <span className="font-medium">{u.name||'(unnamed)'}</span>
               <span className="block text-xs text-gray-500">{u.addr}</span>
             </li>
           ))}
         </ul>}
      </Card>

      {isAdmin&&(
        <Card>
          <h3 className="text-xl font-semibold mb-3">Add University</h3>
          <input className={`${input} mb-3`} placeholder="0xABC… address"
                 value={addr} onChange={e=>setAddr(e.target.value)}/>
          <input className={`${input} mb-4`} placeholder="University name"
                 value={name} onChange={e=>setName(e.target.value)}/>
          <Button className="w-full" onClick={addUni} disabled={adding}>
            {adding?'Adding…':'Add'}
          </Button>
        </Card>
      )}
    </div>
  );
};
export default UniversityListPage;