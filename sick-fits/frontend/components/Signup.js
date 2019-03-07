import React, { Component } from 'react';
import {Mutation, Query} from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';


const SIGNUP_MUTATTION = gql`
    mutation SIGNUP_MUTATTION($email:String!, $name: String!, $password:String!){
        signup(email:$email, name:$name, password:$password){
            id
            email
            name
        }
    }
`;

class Signup extends Component {
    state={
        name:'',
        email:'',
        password:'',
    };
    saveToState = (e)=>{
        this.setState({[e.target.name]:e.target.value});
    };
  render() {
    return (
        <Mutation mutation={SIGNUP_MUTATTION} variables={this.state}>
            {(signup, {error, loading})=>{return (
      <Form method="POST" onSubmit={async (e)=> {e.preventDefault(); 
        const res = await signup();
        this.setState({name:'',email:'', password:''});
        }}>
          <fieldset disabled={loading} aria-busy={loading}>
                <h2>Signup for an account!</h2>
                <Error error={error}/>
            <label htmlForm="email">Email
                <input type="email" name="email" 
                placeholder="email" value={this.state.email} 
                onChange={this.saveToState} />
            </label>
            <label htmlForm="name">Name
                <input type="name" name="name" 
                placeholder="name" value={this.state.name} 
                onChange={this.saveToState} />
            </label>
            <label htmlForm="password">Password
                <input type="password" name="password" 
                placeholder="password" value={this.state.password} 
                onChange={this.saveToState} />
            </label>
            <button type="submit">Signup!</button>
          </fieldset>
          
      </Form>
      )}}
      </Mutation>
    )
  }
}

export default Signup;