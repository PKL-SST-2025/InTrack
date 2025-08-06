import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
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

render(() => (
  <Router>
      <Route path="/" component={Landing} />
      <Route path="/Login" component={Login} />
      <Route path="/Register" component={Register} />
      <Route path="/ResetPasswordEmail" component={ResetPasswordEmail} />
      <Route path="/ResetPasswordNew" component={ResetPasswordNew} />
      <Route path="/Dashboard" component={() => <Navbar><Dashboard /></Navbar>} />
      <Route path="/UserSettings" component={() => <Navbar><UserSettings /></Navbar>} />
      <Route path="/Rooms" component={() => <Navbar><Rooms /></Navbar>} />
      <Route path="/Room" component={() => <Navbar><Room /></Navbar>} />
      <Route path="/RoomJoin" component={() => <Navbar><RoomJoin /></Navbar>} />
      <Route path="/FillingStation" component={() => <Navbar><FillingStation /></Navbar>} />
      <Route path="/RoomLeave" component={() => <Navbar><RoomLeave /></Navbar>} />
      <Route path="/RoomOwner" component={() => <Navbar><RoomOwner /></Navbar>} />
      <Route path="/RoomCreate" component={() => <Navbar><RoomCreate /></Navbar>} />
      <Route path="/RoomEdit" component={() => <Navbar><RoomEdit /></Navbar>} />
  </Router>
), root!);