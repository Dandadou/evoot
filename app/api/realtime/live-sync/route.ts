import {NextResponse} from 'next/server';

type LiveEvent={roomId:string;state:string;currentQuestion:number;version:number;updatedAt:number};
const events=new Map<string,LiveEvent>();

export async function GET(req:Request){
 const u=new URL(req.url);const roomId=u.searchParams.get('roomId')||'';const after=Number(u.searchParams.get('after')||0);
 if(!roomId)return NextResponse.json({error:'roomId required'},{status:400});
 const event=events.get(roomId)||null;
 return NextResponse.json({event:event&&event.version>after?event:null});
}

export async function POST(req:Request){
 try{
  const b=await req.json() as {roomId?:string;state?:string;currentQuestion?:number};
  if(!b.roomId||!b.state)return NextResponse.json({error:'roomId and state required'},{status:400});
  const event:LiveEvent={roomId:b.roomId,state:b.state,currentQuestion:Number(b.currentQuestion||0),version:Date.now(),updatedAt:Date.now()};
  events.set(b.roomId,event);
  return NextResponse.json({ok:true,event});
 }catch{return NextResponse.json({error:'Invalid live event'},{status:400})}
}
