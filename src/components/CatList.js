import { Box, ImageList, ImageListItem } from '@mui/material'
import { useMoralis } from 'react-moralis'
import React, { useState, useEffect } from "react"
import { makeStyles } from '@mui/styles'


const useStyles = makeStyles(theme => ({
    catImg: {
        "&:hover": {
            boxShadow: "10px 5px 5px black;",
            backgroundColor: "blue",
        }
    }
}))


const baseOpenseaURL = "https://opensea.io/assets/"
const baseTestnetOpenseaURL = "https://testnets.opensea.io/assets/"
const baseURI = "https://us-central1-retro-cats.cloudfunctions.net/retro-cats-image-rinkeby?token_id="

export const CatList = ({ catListData, retroCatsAddress, networkId }) => {
    const classes = useStyles()
    const { web3, user, Moralis } = useMoralis()

    const [imageURLs, setImageURLs] = useState({})
    useEffect(() => { getImageUrls(retroCatsAddress) }, [retroCatsAddress, networkId, catListData, user])

    const getImageUrls = async (retroCatsAddress) => {
        const NFTImage = Moralis.Object.extend("NFTImage")
        const query = new Moralis.Query(NFTImage)
        query.equalTo("retroCatsAddress", retroCatsAddress)
        query.containedIn("owner", user.attributes.accounts.map(accounts => accounts.toLowerCase()))
        const results = await query.find()
        console.log(results)
        let imageURLs = {}
        results.forEach(element => {
            let url = element.get("image").url()
            console.log(url)
            let tokenId = element.get("tokenId")
            imageURLs[tokenId] = url
        })
        setImageURLs(imageURLs)
        return imageURLs
    }

    return (
        <div>
            {
                catListData.result.length > 0 ?
                    <ImageList cols={3} rowHeight={270}>
                        {catListData.result.map(cat => (
                            <a href={networkId === 1 ? baseOpenseaURL + retroCatsAddress + "/" + cat.token_id : baseTestnetOpenseaURL + retroCatsAddress + "/" + cat.token_id} target="_blank" rel="noreferrer">
                                <ImageListItem className={classes.catImg} key={cat.token_id} sx={{ padding: 1 }}>
                                    <img
                                        src={imageURLs[cat.token_id]}
                                        alt="retrocat"
                                        loading="lazy"
                                        key={cat.token_id} />
                                </ImageListItem>
                            </a>
                            // 
                        ))}
                    </ImageList >
                    : <Box>No cats found <br /> Maybe hit refresh?</Box>
            }
        </div>
    )
}
