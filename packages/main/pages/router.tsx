import React from 'react';
import LinkedComponent from '@demo/linked/Component';

const Page = props => console.log(props) || (
  <LinkedComponent />
);

export default Page;
