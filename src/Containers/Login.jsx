import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Tooltip, Box, Spinner, Text, Button, Icon, TextField } from 'gestalt';
import { Link } from 'react-router-dom';
import HeaderContainer from '../Components/HeaderContainer';
import styled from 'styled-components';
import hiddenFooter from '../Components/HiddenFooter';
import selfQuery from 'gql_/self.gql';

@graphql(gql`
  mutation login($name: String!, $password: String!) {
    login(name: $name, password: $password) {
      user {
        ...userField
      }
      token
    }
  }
  fragment userField on User {
    id
    name
    avatar
    nick_name
    roles
  }
`)
@hiddenFooter
class Login extends Component {
  state = {
    name: '',
    password: '',
    errorOpen: false,
    message: '',
  };
  handleDismiss() {
    this.setState(() => ({ errorOpen: false }));
  }
  render() {
    let {
      mutate,
      history: { goBack, push },
      setSelfAct,
    } = this.props;
    return (
      <Box paddingX={4} paddingY={10}>
        <form
          onSubmit={e => {
            e.preventDefault();
            mutate({
              variables: {
                name: this.state.name,
                password: this.state.password,
              },
              refetchQueries: [
                {
                  query: selfQuery,
                },
              ],
            })
              .then(({ data: { login: { token, user } } }) => {
                //update cache
                //setSelfAct({ token, user });
                goBack();
              })
              .catch(err => {
                console.log(err);
                this.setState({
                  message: err.graphQLErrors[0].message,
                  errorOpen: true,
                });
              });
          }}
        >
          <Box paddingY={2}>
            <Label htmlFor="name">
              <Text>账号</Text>
            </Label>
            <TextField
              id="name"
              onChange={({ value }) => this.setState({ name: value })}
              type="text"
              value={this.state.name}
              placeholder="请输入账号"
            />
          </Box>
          <Box paddingY={2}>
            <Label htmlFor="password">
              <Text>密码</Text>
            </Label>
            <TextField
              id="password"
              onChange={({ value }) => this.setState({ password: value })}
              type="password"
              value={this.state.password}
              errorMessage={this.state.message}
              placeholder="请输入密码"
            />
          </Box>
          <Box paddingY={2}>
            <Button
              accessibilityExpanded={!!this.state.errorOpen}
              accessibilityHaspopup
              text="登录"
              type="submit"
              color="red"
            />
          </Box>
          <Box paddingY={2}>
            <Link replace to="/join/">
              <Text align="center">没有账号？</Text>
            </Link>
          </Box>
        </form>
      </Box>
    );
  }
}

export default Login;
