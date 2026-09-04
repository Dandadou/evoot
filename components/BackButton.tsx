'use client';

import {useRouter} from 'next/navigation';

type Props={fallback?:string;label?:string;className?:string};

export default function BackButton({fallback='/',label='← Précédent',className='portalButton'}:Props){
  const router=useRouter();
  function goBack(){
    if(typeof window!=='undefined'&&window.history.length>1){
      router.back();
      return;
    }
    router.push(fallback);
  }
  return <button type="button" className={className} onClick={goBack}>{label}</button>;
}
