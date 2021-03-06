USE [DevisBase]
GO
/****** Object:  Table [dbo].[Ressource]    Script Date: 21/12/2017 14:50:58 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Ressource](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Mail] [nvarchar](max) NULL,
	[Initial] [nvarchar](4) NOT NULL,
	[Niveau] [int] NULL,
 CONSTRAINT [PK_Ressource] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tarification]    Script Date: 21/12/2017 14:50:58 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tarification](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[Type] [nvarchar](255) NOT NULL,
	[Tar3] [decimal](18, 0) NULL,
	[Tar5] [decimal](18, 0) NOT NULL,
	[IsAmo] [bit] NULL,
 CONSTRAINT [PK_Tarification] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tarification_Ressource]    Script Date: 21/12/2017 14:50:58 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tarification_Ressource](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[FK_Ressource] [bigint] NOT NULL,
	[FK_Tarification] [bigint] NOT NULL,
 CONSTRAINT [PK_Tarification_Ressource] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Tarification_Ressource]  WITH CHECK ADD  CONSTRAINT [FK_Tarification] FOREIGN KEY([FK_Tarification])
REFERENCES [dbo].[Tarification] ([ID])
GO
ALTER TABLE [dbo].[Tarification_Ressource] CHECK CONSTRAINT [FK_Tarification]
GO
ALTER TABLE [dbo].[Tarification_Ressource]  WITH CHECK ADD  CONSTRAINT [FK_Tarification_Ressources] FOREIGN KEY([FK_Ressource])
REFERENCES [dbo].[Ressource] ([ID])
GO
ALTER TABLE [dbo].[Tarification_Ressource] CHECK CONSTRAINT [FK_Tarification_Ressources]
GO
