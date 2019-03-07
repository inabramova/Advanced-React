import React, { Component } from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import { roundToNearestMinutes } from 'date-fns';

const CREATE_ITEM_MUTATION = gql`
    mutation CREATE_ITEM_MUTATION(
        $title: String!
        $description: String!
        $image: String
        $largeImage: String
        $price: Int!
    ){
        createItem(  
            title : $title
            description : $description
            image : $image
            largeImage : $largeImage
            price : $price
        ) {id}
    }
`;

export default class CreateItem extends Component {
    state={
        title:'title   ',
        description:'description',
        image:'image',
        largeImage:'largeImg',
        price:200
    };
    handleChange = (e)=>{
        const {name, type, value} = e.target;
        const val = type==='number'?parseFloat(value):value;
        this.setState({[name]:val});
    };
    uploadFile = async e => {
        console.log('uploading file');
        const files = e.target.files;
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset','mbac9ugg')
        const res = await fetch('https://api.cloudinary.com/v1_1/ndvwlzpls/image/upload',
        {
            method:'Post',
            body: data
        });
        const file = await res.json();
        console.log(file);
        this.setState({
            image: file.secure_url,
            largeImage: file.eager[0].secure_url,
        });
    };
  render() {
    return (
        <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, {loading, error})=>(
        <Form onSubmit = {async e=> {e.preventDefault(); 
                console.log(this.state);
                const res = await createItem();
                Router.push({
                    pathname:'/item',
                    query:{id:res.data.createItem.id}
                });
            }}>
            <Error error={error}/>
            <fieldset disabled={loading} aria-busy={loading}>
            <label htmlFor="image" >
                    Image
                    <input type="file" 
                        id="image" 
                        name="image" 
                        placeholder="image"
                        onChange={this.uploadFile}
                        required/>
                    {this.state.largeImage && <img src={this.state.largeImage} alt="Preview"/>}
                </label>
                <label htmlFor="title" >
                    Title
                    <input type="text" 
                        id="title" 
                        name="title" 
                        placeholder="title" 
                        value={this.state.title}
                        onChange={this.handleChange}
                        required/>
                </label>
                <label htmlFor="price" >
                    Price
                    <input type="number" 
                        id="price" 
                        name="price" 
                        placeholder="Price" 
                        value={this.state.price}
                        onChange={this.handleChange}
                        required/>
                </label>
                <label htmlFor="description" >
                    Description
                    <textarea type="text" 
                        id="description" 
                        name="description" 
                        placeholder="Enter a description" 
                        value={this.state.description}
                        onChange={this.handleChange}
                        required/>
                </label>
                <button type="submit">Submit</button>                          
            </fieldset>
        </Form>
        )}
        </Mutation>
    )
  }
}

export {CREATE_ITEM_MUTATION};
