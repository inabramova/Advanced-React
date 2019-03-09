import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const RESET_MUTATTION = gql`
  mutation RESET_MUTATTION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`;

class Reset extends Component {
  state = {
    password: '',
    confirmPassword: '',
  };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <Mutation
        mutation={RESET_MUTATTION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        variables={{
          resetToken: this.props.resetToken,
          password: this.state.password,
          confirmPassword: this.state.confirmPassword,
        }}
      >
        {(resetPassword, { error, loading, called }) => (
          <Form
            method="POST"
            onSubmit={async e => {
              e.preventDefault();
              const res = await resetPassword();
              this.setState({
                password: '',
                confirmPassword: '',
              });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Password Reset!</h2>
              <Error error={error} />
              <label htmlFor="password">
                password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="confirmPassword">
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="confirmPassword"
                  value={this.state.confirmPassword}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Reset Password!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Reset;
