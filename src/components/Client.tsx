'use client';

import React from 'react';
// import Avatar from 'react-avatar';

// Define the props interface for the component
interface ClientProps {
  username: string;
}

const Client: React.FC<ClientProps> = ({ username }) => {
  return (
    <div className="client">
      {/* <Avatar name={username} size={50} round="14px" />
      <span className="userName">{username}</span> */}
      <p>{username}</p>
    </div>
  );
};

export default Client;
