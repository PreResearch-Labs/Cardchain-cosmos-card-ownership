package keeper

import (
	"context"

	sdkerrors "cosmossdk.io/errors"
	"github.com/DecentralCardGame/Cardchain/x/cardchain/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/errors"
)

func (k msgServer) SetCollectionStoryWriter(goCtx context.Context, msg *types.MsgSetCollectionStoryWriter) (*types.MsgSetCollectionStoryWriterResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	collection := k.Collections.Get(ctx, msg.CollectionId)
	if msg.Creator != collection.Contributors[0] {
		return nil, sdkerrors.Wrap(errors.ErrUnauthorized, "Invalid creator")
	}

	if collection.Status != types.CStatus_design {
		return nil, types.ErrCollectionNotInDesign
	}

	collection.StoryWriter = msg.StoryWriter

	k.Collections.Set(ctx, msg.CollectionId, collection)

	return &types.MsgSetCollectionStoryWriterResponse{}, nil
}
