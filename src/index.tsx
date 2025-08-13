import { render } from 'solid-js/web';
import { Router, Route, Navigate } from '@solidjs/router';
import './index.css';
import Login from './Login';
import Register from './Register';
import ResetPasswordEmail from './ResetPasswordEmail';
import ResetPasswordNew from './ResetPasswordNew';
import UserSettings from './UserSettings';
import Dashboard from './Dashboard';
import Rooms from './Rooms';
import Navbar from './Navbar';
import Room from './Room';
import RoomJoin from './RoomJoin';
import FillingStation from './FillingStation';
import RoomLeave from './RoomLeave';
import Landing from './Landing';
import RoomOwner from './RoomOwner';
import RoomCreate from './RoomCreate';
import RoomEdit from './RoomEdit';

const root = document.getElementById('root');

type GuardProps = { children: any };
const isAuthed = () => Boolean(localStorage.getItem('token'));
const Protected = (props: GuardProps) => (isAuthed() ? props.children : <Navigate href="/Login" />);
const PublicOnly = (props: GuardProps) => (isAuthed() ? <Navigate href="/Dashboard" /> : props.children);
const Root = () => (isAuthed() ? <Navigate href="/Dashboard" /> : <Landing />);

render(() => (
  <Router>
      <Route path="/" component={Root} />
      <Route path="/Login" component={() => <PublicOnly><Login /></PublicOnly>} />
      <Route path="/Register" component={() => <PublicOnly><Register /></PublicOnly>} />
      <Route path="/ResetPasswordEmail" component={() => <PublicOnly><ResetPasswordEmail /></PublicOnly>} />
      <Route path="/ResetPasswordNew" component={() => <PublicOnly><ResetPasswordNew /></PublicOnly>} />
      <Route path="/Dashboard" component={() => <Protected><Navbar><Dashboard /></Navbar></Protected>} />
      <Route path="/UserSettings" component={() => <Protected><Navbar><UserSettings /></Navbar></Protected>} />
      <Route path="/Rooms" component={() => <Protected><Navbar><Rooms /></Navbar></Protected>} />
      <Route path="/Room" component={() => <Protected><Navbar><Room /></Navbar></Protected>} />
      <Route path="/RoomJoin" component={() => <Protected><Navbar><RoomJoin /></Navbar></Protected>} />
      <Route path="/FillingStation" component={() => <Protected><Navbar><FillingStation /></Navbar></Protected>} />
      <Route path="/RoomLeave" component={() => <Protected><Navbar><RoomLeave /></Navbar></Protected>} />
      <Route path="/RoomOwner" component={() => <Protected><Navbar><RoomOwner /></Navbar></Protected>} />
      <Route path="/RoomCreate" component={() => <Protected><Navbar><RoomCreate /></Navbar></Protected>} />
      <Route path="/RoomEdit" component={() => <Protected><Navbar><RoomEdit /></Navbar></Protected>} />
  </Router>
), root!);